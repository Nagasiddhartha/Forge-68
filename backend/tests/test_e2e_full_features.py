import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_system_features():
    # 1. Preflight & Diagnostics
    r = client.get('/api/v1/system/preflight')
    assert r.status_code == 200
    preflight = r.json()
    assert preflight['deterministic_fallback_ready'] is True

    # 2. Zero-Egress Endpoint
    r = client.get('/api/v1/system/egress')
    assert r.status_code == 200
    egress = r.json()
    assert egress['status'] == 'ISOLATED'
    assert egress['air_gapped'] is True
    assert egress['egress_bytes'] == 0
    assert egress['external_requests_count'] == 0

    # 3. Deliverables (.docx generation)
    payload = {
        'asset_id': 'R-204',
        'requester': 'operator_lead',
        'role': 'ENGINEER',
        'classification': 'INTERNAL',
        'locale': 'en',
        'observations': [{'metric': 'Operating Pressure', 'observed_value': '33.2 bar', 'normal_value': '31.2 bar', 'status': 'HIGH'}],
        'calculations': [{'name': 'Pressure Variance', 'formula': 'P_obs - P_norm', 'result': '2.0 bar', 'status': 'WARNING'}],
        'verification_checks': [{'name': 'PROVENANCE', 'status': 'VERIFIED', 'details': 'All sources verified'}],
        'evidence_digests': [{'evidence_id': 'evd-001', 'source': 'doc:SOP-R204', 'sha256': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}],
        'executive_summary': 'Hydrocracker R-204 pressure variance anomaly verified and sign-off required.'
    }
    r = client.post('/api/v1/deliverables/approval-note', json=payload)
    assert r.status_code == 200
    gen_res = r.json()
    assert gen_res['file_size_bytes'] > 1000

    # 4. Deliverables download
    file_id = gen_res['file_id']
    r = client.get(f'/api/v1/deliverables/download/{file_id}')
    assert r.status_code == 200
    assert len(r.content) == gen_res['file_size_bytes']

    # 5. Offline Fallback Custom Query (English)
    r = client.post('/api/v1/agent/query', json={
        'query': 'What is the maintenance history of Pump P-201?',
        'role': 'ENGINEER',
        'classification': 'INTERNAL',
        'locale': 'en'
    })
    assert r.status_code == 200
    q_data = r.json()
    assert q_data['status'] in ('SUCCESS', 'OFFLINE_FALLBACK')
    assert q_data['verification'] is not None
    assert 'status' in q_data['verification']

    # 6. Offline Fallback Custom Query (Kannada)
    r = client.post('/api/v1/agent/query', json={
        'query': 'What is the operating pressure and vibration limit for R-204?',
        'role': 'ENGINEER',
        'classification': 'INTERNAL',
        'locale': 'kn'
    })
    assert r.status_code == 200
    q_kn = r.json()
    assert q_kn['status'] in ('SUCCESS', 'OFFLINE_FALLBACK')
    assert len(q_kn['final_answer']) > 50

    # 7. 4 Demo Flagship Scenarios
    scenarios = [
        'r204_investigation',
        'r204_pressure_variance',
        'policy_denial',
        'prompt_injection'
    ]
    for scenario in scenarios:
        r = client.post('/api/v1/demo/run', json={'scenario': scenario, 'deterministic': True})
        assert r.status_code == 200
        d_res = r.json()
        assert d_res['status'] in ('SUCCESS', 'POLICY_DENIED', 'REJECTED')
        assert d_res['verification'] is not None
        assert 'status' in d_res['verification']
