pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "amitchandane693/axis-backend:latest"
        FRONTEND_IMAGE = "amitchandane693/axis-frontend:latest"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/amitchandanepatil/axis-bank-internet-banking.git'
            }
        }

        stage('Build Backend Jar') {
            steps {
                dir('workspace/auth-service') {
                    sh '''
                    chmod +x mvnw
                    ./mvnw clean package -DskipTests
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker build -t $BACKEND_IMAGE workspace/auth-service'
                sh 'docker build -t $FRONTEND_IMAGE frontend'
            }
        }

        stage('Push Images') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin

                    docker push $BACKEND_IMAGE
                    docker push $FRONTEND_IMAGE
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                docker rm -f axis-backend-container || true
                docker rm -f axis-frontend-container || true
                docker rm -f axis-nginx-container || true

                docker compose down || true
                docker compose pull
                docker compose up -d
                docker ps
                '''
            }
        }
    }

    post {
        success {
            echo 'Application deployed successfully.'
        }

        failure {
            echo 'Pipeline failed.'
        }
    }
}
