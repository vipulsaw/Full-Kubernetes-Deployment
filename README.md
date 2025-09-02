# MERN Microservices CI/CD Deployment with Jenkins, Docker, ECR, and EC2

This project demonstrates a complete CI/CD setup for deploying a **MERN-based microservices architecture** using:

- **Jenkins Pipelines**
- **Docker**
- **AWS ECR (Elastic Container Registry)**
- **EC2 instances (SSH deployment)**
- **Nginx reverse proxy**

## 🚀 What’s Included

- **Microservices Architecture**:
  - `helloService`: API for greeting functionality
  - `profileService`: API for user profile features
  - `frontend`: React app consuming both APIs

- **Dockerized Services**:
  - Each service has its own Dockerfile
  - Independent container builds and deployments

- **CI/CD Pipelines**:
  - Each service has its own Jenkinsfile
  - Pipelines build, tag, push to AWS ECR
  - EC2 hosts pull latest image and run containers

- **Nginx Reverse Proxy**:
  - Routes:
    - `/hello → :3001`
    - `/profile → :3002`
    - `/ → frontend (e.g., :3000)`

---

## ✨ Project Structure

```
mern-orchestration/
├── backend/
│   ├── helloService/
│   │   └── Dockerfile, index.js, Jenkinsfile-hello. etc.
│   └── profileService/
│       └── Dockerfile, index.js, Jenkinsfile-profile etc.
├── frontend/
│   └── Dockerfile, src/, Jenkinsfile-frontend, etc.
└── README.md
```

## 🔄 Jenkins CI/CD Pipeline Overview

Each Jenkinsfile performs the following stages:

1. **Checkout Git Repo**
2. **Build Docker Image**
3. **Login to AWS ECR**
4. **Push Docker Image**
5. **Tag as `latest` for consistent deployment**
6. **Clean Docker Images**
7. **SSH into EC2 & Deploy Container**
   - Stops old container (if any)
   - Pulls new image from ECR
   - Runs the updated container

---

## 🔐 Jenkins Credentials Used

 | Description                             |
 |-----------------------------------------|
 | AWS Access Key ID                       |
 | AWS Secret Access Key                 |
 | EC2 private SSH key                     |
 | EC2 username (`ec2-user` or custom)     |
 | EC2 public IP                           |
 | MongoDB connection string               |
 | GitHub token/credentials                |
 | Database Url                            |
 | EC2 username (`ec2-user` or custom)     |
 | EC2 public IP                           |


---

## 🧪 How to Access the Services

After deployment, services are available at:

| Service          | Port   | Endpoint                      | Nginx Route             |
|------------------|--------|-------------------------------|-------------------------|
| Hello Service    | 3001   | http://<EC2-IP>:3001          | http://<domain>/hello   |
| Profile Service  | 3002   | http://<EC2-IP>:3002          | http://<domain>/profile |
| Frontend         | 3000   | http://<EC2-IP>:3000          | http://<domain>/        |

Make sure Nginx is configured to forward requests to the correct internal ports.

---

## 🛠 Sample Nginx Config

```nginx
server {
    listen 80;
    server_name api-mern.playbook.org.in;

    location /hello {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /profile {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🚀 How to Trigger Each Jenkins Job

- **helloService**: Jenkinsfile-hello (backend/helloService)
- **profileService**: Jenkinsfile-profile (backend/profileService)
- **frontend**: Jenkinsfile-frontend (frontend)

## 🧰 Environment Variables Passed to Containers

**helloService/profileService**
- `PORT` (e.g., 3001, 3002)
- `MONGO_URL` (MongoDB connection string)

**frontend**
- `HELLO_SERVICE`: Public URL (e.g., http://<domain>/hello/)
- `USER_SERVICE`: Public URL (e.g., http://<domain>/profile/)


## 📄 Notes

- Containers run with `--restart unless-stopped` to survive EC2 reboots.
- Jenkins pipelines use latest tagging by default via `${IMAGE_TAG}`.
- Each EC2 instance must have Docker installed and the appropriate user added to the docker group.
- Create a Launch Template that includes:
  - An AMI with Docker installed
  - A user data script to pull the latest image from ECR and run the container
- Define an Auto Scaling Group (ASG) using the above Launch Template
- Add a Target Group and attach it to an Application Load Balancer (ALB)
- Configure scaling policies (CPU-based, request-count, schedule-based)
- This ensures new EC2 instances launched by the ASG are auto-configured with your backend containers.


---

## 📄 Outputs

### Backend Outputs

Hello API Output with IP

<img width="399" height="58" alt="image" src="https://github.com/user-attachments/assets/23a5c792-f37b-445d-a108-831ce853b604" />


Hello API Output with Website Address

<img width="421" height="53" alt="image" src="https://github.com/user-attachments/assets/3a173cb4-d35c-4cf4-b56c-ec59ae28e64d" />

Website Output frontend Via IP

<img width="459" height="75" alt="image" src="https://github.com/user-attachments/assets/e6bd8e1a-96f0-4646-932d-8a918eef8ec5" />


Website Output frontend Via Website

<img width="434" height="77" alt="image" src="https://github.com/user-attachments/assets/70990c09-1fce-4892-bb6d-a17b812e61cb" />


## ☸️ Jenkins + EKS Deployment (Optional Variant)

You can also deploy the MERN microservices stack to **Amazon EKS (Elastic Kubernetes Service)** with Jenkins:

### ✅ Steps:

#### 1. Create EKS Cluster:
- Use `eksctl`, Terraform, or AWS Console
- Make sure `kubectl` and `aws-iam-authenticator` are installed on the Jenkins agent

#### 2. Configure Kubeconfig in Jenkins Agent:

```
aws eks update-kubeconfig --region ap-south-1 --name thiru-mern-cluster
```

#### 3. Build & Push Docker Images to ECR:

Same steps as your EC2-based pipelines

#### 4. Helm Deployment:

- Package your services into Helm charts (e.g., frontend, hello, profile)

In Jenkins, add a Helm deploy will have something like below:

```
helm upgrade --install mern-website . \
-f values.yaml \
--set-string image.repository="vipulsaw/mernwebsite" \
--set-string image.tag="v1" \
--set-string hello_service="<url>" \
--set-string profile_service="<url>" \
--set service.port=80 \
--set service.targetPort=3001 \
--set-string service.type="NodePort" \ 
--set replicaCount=1
```

The same helm will customised for the hello and profile services

#### 5. DNS and Ingress:

- Use ALB Ingress Controller or NGINX Ingress Controller
- Map domain names to backend/frontend services via Ingress resources

#### 6. Scaling and Monitoring:

- Use Horizontal Pod Autoscalers (HPA) for autoscaling based on CPU/requests











