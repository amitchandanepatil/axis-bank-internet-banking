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
                    sh './mvnw clean package -DskipTests'
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
                docker compose down
                docker compose pull
                docker compose up -d
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
