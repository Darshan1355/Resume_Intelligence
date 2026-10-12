@description('Location for Backend Service')
param location string = resourceGroup().location

@description('Container App Name')
param appName string = 'careermind-backend'

@description('Environment Resource ID')
param environmentId string

@description('ACR Login Server')
param acrLoginServer string

@description('ACR Admin Username')
param acrUsername string

@description('ACR Admin Password')
@secure()
param acrPassword string

@description('Docker Image Tag')
param imageTag string = 'latest'

@description('MySQL Host FQDN')
param dbHost string

@description('MySQL Database Name')
param dbName string

@description('MySQL Username')
param dbUsername string

@description('MySQL Password')
@secure()
param dbPassword string

@description('Internal ML Service URL')
param mlServiceUrl string

@description('JWT Secret Key')
@secure()
param jwtSecret string

@description('Allow external ingress to backend for Swagger UI')
param enableExternalIngress bool = true

resource backendApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: appName
  location: location
  properties: {
    managedEnvironmentId: environmentId
    configuration: {
      secrets: [
        {
          name: 'acr-password'
          value: acrPassword
        }
        {
          name: 'db-password'
          value: dbPassword
        }
        {
          name: 'jwt-secret'
          value: jwtSecret
        }
      ]
      registries: [
        {
          server: acrLoginServer
          username: acrUsername
          passwordSecretRef: 'acr-password'
        }
      ]
      ingress: {
        external: enableExternalIngress
        targetPort: 8080
        transport: 'auto'
        allowInsecure: false
        corsPolicy: {
          allowedOrigins: [
            '*'
          ]
          allowedMethods: [
            'GET'
            'POST'
            'PUT'
            'DELETE'
            'OPTIONS'
          ]
          allowedHeaders: [
            '*'
          ]
        }
      }
    }
    template: {
      containers: [
        {
          name: 'backend'
          image: '${acrLoginServer}/careermind-backend:${imageTag}'
          resources: {
            cpu: json('0.5')
            memory: '1.0Gi'
          }
          env: [
            {
              name: 'PORT'
              value: '8080'
            }
            {
              name: 'DB_URL'
              value: 'jdbc:mysql://${dbHost}:3306/${dbName}?createDatabaseIfNotExist=true&useSSL=true&requireSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true'
            }
            {
              name: 'DB_USERNAME'
              value: dbUsername
            }
            {
              name: 'DB_PASSWORD'
              secretRef: 'db-password'
            }
            {
              name: 'DB_DRIVER'
              value: 'com.mysql.cj.jdbc.Driver'
            }
            {
              name: 'DB_DIALECT'
              value: 'org.hibernate.dialect.MySQLDialect'
            }
            {
              name: 'ML_SERVICE_URL'
              value: mlServiceUrl
            }
            {
              name: 'JWT_SECRET'
              secretRef: 'jwt-secret'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
}

output fqdn string = backendApp.properties.configuration.ingress.fqdn
output internalUrl string = 'http://${appName}'
