@description('Location for Frontend Service')
param location string = resourceGroup().location

@description('Container App Name')
param appName string = 'careermind-frontend'

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

resource frontendApp 'Microsoft.App/containerApps@2024-03-01' = {
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
        external: true // Public web traffic
        targetPort: 80
        transport: 'auto'
        allowInsecure: false
      }
    }
    template: {
      containers: [
        {
          name: 'frontend'
          image: '${acrLoginServer}/careermind-frontend:${imageTag}'
          resources: {
            cpu: json('0.5')
            memory: '1.0Gi'
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 5
      }
    }
  }
}

output fqdn string = frontendApp.properties.configuration.ingress.fqdn
output url string = 'https://${frontendApp.properties.configuration.ingress.fqdn}'
