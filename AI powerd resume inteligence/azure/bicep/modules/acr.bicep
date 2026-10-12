@description('Location for all resources')
param location string = resourceGroup().location

@description('ACR Name (must be globally unique and alphanumeric)')
param acrName string

@description('ACR SKU')
@allowed([
  'Basic'
  'Standard'
  'Premium'
])
param acrSku string = 'Basic'

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: {
    name: acrSku
  }
  properties: {
    adminUserEnabled: true
  }
}

output acrId string = acr.id
output loginServer string = acr.properties.loginServer
output acrAdminUsername string = acr.listCredentials().username
output acrAdminPassword string = acr.listCredentials().passwords[0].value
