# Zero-Trust-Mesh Full Report

## Attack Scenario Results

| Scenario | HTTP Status | Decision | Risk Score | Response Time (ms) |
|----------|-------------|----------|------------|--------------------|
| normal | 200 | ALLOW | 8 | 77 |
| unauthorized | 200 | BLOCK | 86 | 23 |
| expired-token | 200 | BLOCK | 65 | 23 |
| invalid-sig | 200 | BLOCK | 95 | 20 |
| lateral | 200 | BLOCK | 92 | 13 |

## Performance Metrics (after 200 normal requests)

| Metric | Value |
|--------|-------|
| Total Requests Analyzed | 200 |
| Average Latency | 1 ms |
| P50 Latency | 1 ms |
| P95 Latency | 1 ms |
| P99 Latency | 5 ms |
| Throughput | 21858 req/min |
| Error Rate | 0 % |
| Average Proxy Overhead | 1 ms |

## Summary

The Zero-Trust-Mesh proxy was successfully validated against multiple attack scenarios. As demonstrated above, unauthorized and malicious traffic patterns (expired tokens, invalid signatures, lateral movement) are effectively detected and blocked. The system dynamically updates risk scores based on payload anomaly and contextual indicators. Under load (200 requests), the proxy maintains reasonable latency percentiles, proving the zero-trust evaluation pipeline can execute quickly and efficiently without causing major bottlenecks in traffic flow.
