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

        stage('SonarQube Analysis') {
            steps {
                dir('workspace/auth-service') {
                    withSonarQubeEnv('axis-sonarqube') {
                        sh '''
                            ./mvnw sonar:sonar \
                              -Dsonar.projectKey=axis-bank-internet-banking \
                              -Dsonar.projectName="Axis Bank Internet Banking" \
                              -Dsonar.java.binaries=target/classes
                        '''
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    docker build -t $BACKEND_IMAGE workspace/auth-service
                    docker build -t $FRONTEND_IMAGE frontend
                '''
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
                        echo "$DOCKER_PASS" | docker login \
                          -u "$DOCKER_USER" \
                          --password-stdin

                        docker push "$BACKEND_IMAGE"
                        docker push "$FRONTEND_IMAGE"
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'axis-rds-url',
                        variable: 'DB_URL'
                    ),
                    usernamePassword(
                        credentialsId: 'axis-rds-creds',
                        usernameVariable: 'DB_USERNAME',
                        passwordVariable: 'DB_PASSWORD'
                    )
                ]) {
                    sh '''
                        export DB_URL
                        export DB_USERNAME
                        export DB_PASSWORD

                        docker rm -f axis-backend-container || true
                        docker rm -f axis-frontend-container || true
                        docker rm -f axis-nginx-container || true

                        docker compose down --remove-orphans || true
                        docker compose pull
                        docker compose up -d

                        sleep 25

                        docker ps
                        docker logs axis-backend-container --tail 100
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Code quality passed and application deployed successfully.'
        }

        failure {
            echo 'Pipeline failed. Review the SonarQube analysis or failed stage.'
        }

        always {
            sh 'docker logout || true'
        }
    }
}