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

| ID                      | Description                             |
|-------------------------|-----------------------------------------|
| `thiru-access-key-id`   | AWS Access Key ID                       |
| `thiru-secret-access-key` | AWS Secret Access Key                 |
| `thiru-ec2`             | EC2 private SSH key                     |
| `ec2-backend-user`      | EC2 username (`ec2-user` or custom)     |
| `ec2-backend-host`      | EC2 public IP                           |
| `mern-database`         | MongoDB connection string               |
| `thiru-github-access`   | GitHub token/credentials                |
| `mern-database`         | Database Url                            |
| `ec2-frontend-user`     | EC2 username (`ec2-user` or custom)     |
| `ec2-frontend-host`     | EC2 public IP                           |


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

Jenkins Hello API

![alt text](output/hello_jenkins.png)

ECR hello API

![alt text](output/ecr_hello.png)

Jenkins Profile API

![alt text](output/profile_jenkins.png)

ECR Profile API

![alt text](output/ecr_profile.png)

Docker Ouput - Backend

![alt text](output/dockers_backend.png)

Note: The backend can be run in 2 servers if needed for hello API and Profile APi, to demo purpose i have used single EC2 to both the API

Hello API Output with IP

![alt text](output/api_hello_with_ip.png)

Hello API Output with Website Address

![alt text](output/api_hello.png)

USER API Output with IP

![alt text](output/api_user_with_ip.png)

User API Output with Website Address

![alt text](output/api_user.png)

### Frontend Outputs

Jenkins Front End

![alt text](output/front_jenkins.png)

ECR frontend

![alt text](output/ecr_frontend.png)

Website Output frontend Via IP

![alt text](output/front_ip.png)

Website Output frontend Via Website

![alt text](output/front_domain.png)

AWS Instance List

![alt text](output/aws_output.png)


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
--set-string image.repository="thirumalaipy/mernwebsite" \
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

**Releated Previous Assignments**

- https://github.com/thirumalai-py/k8-learner-backend
- https://github.com/thirumalai-py/k8-learner-frontend 










