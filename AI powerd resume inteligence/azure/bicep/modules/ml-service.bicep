@description('Location for ML Service')
param location string = resourceGroup().location

@description('Container App Name')
param appName string = 'careermind-ml-service'

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

resource mlServiceApp 'Microsoft.App/containerApps@2024-03-01' = {
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
      ]
      registries: [
        {
          server: acrLoginServer
          username: acrUsername
          passwordSecretRef: 'acr-password'
        }
      ]
      ingress: {
        external: false // Internal to the ACA Environment only
        targetPort: 8000
        transport: 'auto'
        allowInsecure: false
      }
    }
    template: {
      containers: [
        {
          name: 'ml-service'
          image: '${acrLoginServer}/careermind-ml-service:${imageTag}'
          resources: {
            cpu: json('1.0')
            memory: '2.0Gi'
          }
          env: [
            {
              name: 'PORT'
              value: '8000'
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

output fqdn string = mlServiceApp.properties.configuration.ingress.fqdn
output internalUrl string = 'http://${appName}'
