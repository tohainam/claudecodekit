# Cloud Security

## Table of Contents
1. [Shared Responsibility Model](#shared-responsibility-model)
2. [Identity & Access Management](#identity--access-management)
3. [Network Security](#network-security)
4. [Data Protection](#data-protection)
5. [Secrets Management](#secrets-management)
6. [Container Security](#container-security)
7. [Serverless Security](#serverless-security)
8. [Infrastructure as Code](#infrastructure-as-code)
9. [Monitoring & Logging](#monitoring--logging)
10. [Platform-Specific Guidance](#platform-specific-guidance)

---

## Shared Responsibility Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    SHARED RESPONSIBILITY                         │
├─────────────────────────────────────────────────────────────────┤
│  CUSTOMER RESPONSIBILITY (Security IN the Cloud)                │
│  ─────────────────────────────────────────────────              │
│  • Customer data                                                 │
│  • Application code                                              │
│  • Identity & access management                                  │
│  • Operating system, network & firewall configuration           │
│  • Client-side data encryption                                  │
│  • Server-side encryption (file system and/or data)             │
│  • Network traffic protection (encryption, integrity, identity) │
├─────────────────────────────────────────────────────────────────┤
│  CLOUD PROVIDER RESPONSIBILITY (Security OF the Cloud)          │
│  ─────────────────────────────────────────────────              │
│  • Hardware/infrastructure                                       │
│  • Software (compute, storage, database, networking)            │
│  • Regions, availability zones, edge locations                  │
│  • Physical security                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Identity & Access Management

### Principle of Least Privilege

```yaml
# BAD: Overly permissive policy
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "*",
    "Resource": "*"
  }]
}

# GOOD: Minimal permissions
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:GetObject",
      "s3:PutObject"
    ],
    "Resource": "arn:aws:s3:::my-bucket/uploads/*"
  }]
}
```

### Service Account Security

```yaml
# Kubernetes - Use service accounts with minimal permissions
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-service-account
  annotations:
    # AWS EKS - IAM role for service account
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789:role/app-role
    # GCP GKE - Workload Identity
    iam.gke.io/gcp-service-account: app@project.iam.gserviceaccount.com
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: app-role
rules:
  - apiGroups: [""]
    resources: ["secrets"]
    resourceNames: ["app-secrets"]
    verbs: ["get"]
```

### MFA and Access Keys

```python
# Enforce MFA for sensitive operations
def require_mfa(action):
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            if not request.user.mfa_verified:
                raise PermissionDenied("MFA required for this action")
            return func(request, *args, **kwargs)
        return wrapper
    return decorator

# Rotate access keys regularly
# AWS CLI command for reference:
# aws iam create-access-key --user-name my-user
# aws iam delete-access-key --access-key-id OLD_KEY
```

---

## Network Security

### VPC Configuration

```hcl
# Terraform - Secure VPC setup
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = { Name = "production-vpc" }
}

# Private subnets for workloads
resource "aws_subnet" "private" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = false  # No public IPs
}

# Public subnets only for load balancers
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.100.0/24"
  map_public_ip_on_launch = false  # Still no auto-assign
}
```

### Security Groups

```hcl
# GOOD: Restrictive security group
resource "aws_security_group" "app" {
  name   = "app-sg"
  vpc_id = aws_vpc.main.id

  # Only allow traffic from load balancer
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Only allow outbound HTTPS (for API calls)
  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # No SSH from anywhere - use SSM Session Manager
}

# BAD: Open security group
resource "aws_security_group" "bad" {
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]  # Open to world!
  }
}
```

### Private Endpoints

```hcl
# Use VPC endpoints instead of internet access
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.us-east-1.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.private.id]
}

resource "aws_vpc_endpoint" "secrets_manager" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.us-east-1.secretsmanager"
  vpc_endpoint_type   = "Interface"
  security_group_ids  = [aws_security_group.vpc_endpoint.id]
  private_dns_enabled = true
}
```

---

## Data Protection

### Encryption at Rest

```hcl
# S3 bucket with encryption
resource "aws_s3_bucket" "data" {
  bucket = "my-secure-bucket"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "data" {
  bucket = aws_s3_bucket.data.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.data.arn
    }
    bucket_key_enabled = true
  }
}

# Block public access
resource "aws_s3_bucket_public_access_block" "data" {
  bucket = aws_s3_bucket.data.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# RDS encryption
resource "aws_db_instance" "main" {
  storage_encrypted   = true
  kms_key_id         = aws_kms_key.rds.arn
  # ...
}
```

### Encryption in Transit

```hcl
# Enforce HTTPS on load balancer
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate.main.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

# Redirect HTTP to HTTPS
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}
```

---

## Secrets Management

### Cloud Secrets Managers

```python
# AWS Secrets Manager
import boto3
from botocore.exceptions import ClientError

def get_secret(secret_name):
    client = boto3.client('secretsmanager')
    try:
        response = client.get_secret_value(SecretId=secret_name)
        return response['SecretString']
    except ClientError as e:
        raise e

# GCP Secret Manager
from google.cloud import secretmanager

def get_secret_gcp(project_id, secret_id, version="latest"):
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{project_id}/secrets/{secret_id}/versions/{version}"
    response = client.access_secret_version(request={"name": name})
    return response.payload.data.decode("UTF-8")

# Azure Key Vault
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient

def get_secret_azure(vault_url, secret_name):
    credential = DefaultAzureCredential()
    client = SecretClient(vault_url=vault_url, credential=credential)
    return client.get_secret(secret_name).value
```

### Kubernetes Secrets

```yaml
# BAD: Plain secrets in manifests
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  password: cGFzc3dvcmQxMjM=  # base64 is NOT encryption!

# GOOD: Use external secrets operator
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: app-secrets
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: app-secrets
  data:
    - secretKey: password
      remoteRef:
        key: production/app/database
        property: password

# GOOD: Use sealed secrets (GitOps)
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: app-secrets
spec:
  encryptedData:
    password: AgBy3i... # Encrypted with cluster's public key
```

---

## Container Security

### Dockerfile Best Practices

```dockerfile
# GOOD: Multi-stage build with minimal base
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Run as non-root
USER nonroot

EXPOSE 8080
CMD ["server.js"]
```

```dockerfile
# Security checklist for Dockerfiles:
# 1. Use specific version tags (not :latest)
# 2. Use minimal base images (alpine, distroless)
# 3. Run as non-root user
# 4. Don't copy unnecessary files (.dockerignore)
# 5. Don't store secrets in images
# 6. Scan images for vulnerabilities
# 7. Use multi-stage builds
# 8. Set read-only filesystem when possible
```

### Kubernetes Security

```yaml
# Pod Security Context
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 1000
    seccompProfile:
      type: RuntimeDefault

  containers:
    - name: app
      image: myapp:1.0.0
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop:
            - ALL

      resources:
        limits:
          cpu: "500m"
          memory: "512Mi"
        requests:
          cpu: "100m"
          memory: "128Mi"

      volumeMounts:
        - name: tmp
          mountPath: /tmp

  volumes:
    - name: tmp
      emptyDir: {}
```

```yaml
# Network Policy - Default deny
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress

---
# Allow specific traffic
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-app-traffic
spec:
  podSelector:
    matchLabels:
      app: web
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: api
      ports:
        - port: 8080
```

---

## Serverless Security

### Lambda Security

```python
# AWS Lambda - Secure handler
import json
import boto3
from aws_lambda_powertools import Logger, Tracer
from aws_lambda_powertools.utilities.validation import validate

logger = Logger()
tracer = Tracer()

INPUT_SCHEMA = {
    "type": "object",
    "properties": {
        "user_id": {"type": "string", "pattern": "^[a-zA-Z0-9-]+$"},
        "action": {"type": "string", "enum": ["read", "write"]}
    },
    "required": ["user_id", "action"]
}

@logger.inject_lambda_context
@tracer.capture_lambda_handler
def handler(event, context):
    try:
        # Validate input
        body = json.loads(event.get('body', '{}'))
        validate(event=body, schema=INPUT_SCHEMA)

        # Check authorization
        claims = event['requestContext']['authorizer']['claims']
        if claims['sub'] != body['user_id']:
            return {'statusCode': 403, 'body': 'Forbidden'}

        # Process request
        result = process_request(body)

        return {
            'statusCode': 200,
            'body': json.dumps(result),
            'headers': {
                'Content-Type': 'application/json',
                'X-Content-Type-Options': 'nosniff'
            }
        }
    except Exception as e:
        logger.exception("Error processing request")
        return {'statusCode': 500, 'body': 'Internal error'}
```

```hcl
# Lambda IAM - Minimal permissions
resource "aws_iam_role_policy" "lambda" {
  name = "lambda-policy"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem"
        ]
        Resource = aws_dynamodb_table.main.arn
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "${aws_cloudwatch_log_group.lambda.arn}:*"
      }
    ]
  })
}
```

---

## Infrastructure as Code

### Security Scanning

```yaml
# GitHub Actions - IaC Security Scanning
name: Security Scan
on: [push, pull_request]

jobs:
  terraform-security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Checkov
        uses: bridgecrewio/checkov-action@master
        with:
          directory: terraform/
          framework: terraform

      - name: Run tfsec
        uses: aquasecurity/tfsec-action@v1.0.0
        with:
          working_directory: terraform/

      - name: Run Trivy
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'config'
          scan-ref: '.'
```

### Common Misconfigurations

```hcl
# BAD: Public S3 bucket
resource "aws_s3_bucket_acl" "bad" {
  bucket = aws_s3_bucket.data.id
  acl    = "public-read"  # Never do this!
}

# BAD: Unencrypted RDS
resource "aws_db_instance" "bad" {
  storage_encrypted = false  # Should be true
}

# BAD: Open security group
resource "aws_security_group_rule" "bad" {
  cidr_blocks = ["0.0.0.0/0"]
  from_port   = 22
  to_port     = 22  # SSH open to world
}

# BAD: Hardcoded secrets
resource "aws_db_instance" "bad" {
  password = "MyPassword123!"  # Never hardcode!
}
```

---

## Monitoring & Logging

### CloudTrail / Audit Logging

```hcl
# AWS CloudTrail
resource "aws_cloudtrail" "main" {
  name                          = "main-trail"
  s3_bucket_name               = aws_s3_bucket.cloudtrail.id
  include_global_service_events = true
  is_multi_region_trail        = true
  enable_log_file_validation   = true
  kms_key_id                   = aws_kms_key.cloudtrail.arn

  event_selector {
    read_write_type           = "All"
    include_management_events = true

    data_resource {
      type   = "AWS::S3::Object"
      values = ["arn:aws:s3:::"]
    }
  }
}

# CloudWatch Alarms for security events
resource "aws_cloudwatch_metric_alarm" "root_login" {
  alarm_name          = "root-account-login"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "RootAccountUsage"
  namespace           = "CloudTrailMetrics"
  period              = 300
  statistic           = "Sum"
  threshold           = 1
  alarm_actions       = [aws_sns_topic.security_alerts.arn]
}
```

---

## Platform-Specific Guidance

### AWS Security Tools

| Service | Purpose |
|---------|---------|
| **GuardDuty** | Threat detection, anomaly detection |
| **Security Hub** | Centralized security findings |
| **Inspector** | Vulnerability scanning |
| **Macie** | Sensitive data discovery |
| **Config** | Configuration compliance |
| **IAM Access Analyzer** | External access analysis |
| **Secrets Manager** | Secrets storage and rotation |
| **KMS** | Key management |

### GCP Security Tools

| Service | Purpose |
|---------|---------|
| **Security Command Center** | Centralized security management |
| **Cloud Armor** | WAF and DDoS protection |
| **VPC Service Controls** | Data exfiltration prevention |
| **Binary Authorization** | Container image verification |
| **Secret Manager** | Secrets storage |
| **Cloud KMS** | Key management |

### Azure Security Tools

| Service | Purpose |
|---------|---------|
| **Defender for Cloud** | Unified security management |
| **Sentinel** | SIEM and SOAR |
| **Key Vault** | Secrets and key management |
| **DDoS Protection** | DDoS mitigation |
| **Firewall** | Network security |
| **Policy** | Compliance and governance |
