targetScope = 'resourceGroup'

@description('Deployment location')
param location string = resourceGroup().location

@description('Prefix for resource names (lowercase alphanumeric)')
@minLength(3)
@maxLength(15)
param prefix string = 'careermind'

@description('Environment suffix (dev, staging, prod)')
param environment string = 'prod'

@description('MySQL Administrator Login')
param dbAdminUsername string = 'careermind'

@description('MySQL Administrator Password')
@secure()
param dbAdminPassword string

@description('JWT Secret Key (min 32 characters)')
@secure()
param jwtSecret string = '404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970'

@description('Docker Image Tag to deploy')
param imageTag string = 'latest'

var uniqueSuffix = uniqueString(resourceGroup().id)
var acrName = '${prefix}acr${uniqueSuffix}'
var mysqlServerName = '${prefix}-mysql-${uniqueSuffix}'
var environmentName = '${prefix}-aca-env-${environment}'

// 1. Azure Container Registry
module acrModule 'modules/acr.bicep' = {
  name: 'acrDeployment'
  params: {
    location: location
    acrName: acrName
    acrSku: 'Basic'
  }
}

// 2. Azure Database for MySQL Flexible Server
module mysqlModule 'modules/mysql.bicep' = {
  name: 'mysqlDeployment'
  params: {
    location: location
    serverName: mysqlServerName
    adminLogin: dbAdminUsername
    adminPassword: dbAdminPassword
    databaseName: 'careermind_db'
    skuName: 'Standard_B1ms'
  }
}

// 3. Azure Container Apps Managed Environment
module acaEnvModule 'modules/aca-env.bicep' = {
  name: 'acaEnvDeployment'
  params: {
    location: location
    environmentName: environmentName
  }
}

// 4. FastAPI Machine Learning & NLP Microservice
module mlServiceModule 'modules/ml-service.bicep' = {
  name: 'mlServiceDeployment'
  params: {
    location: location
    appName: 'careermind-ml'
    environmentId: acaEnvModule.outputs.environmentId
    acrLoginServer: acrModule.outputs.loginServer
    acrUsername: acrModule.outputs.acrAdminUsername
    acrPassword: acrModule.outputs.acrAdminPassword
    imageTag: imageTag
  }
}

// 5. Spring Boot Java Backend
module backendModule 'modules/backend.bicep' = {
  name: 'backendDeployment'
  params: {
    location: location
    appName: 'careermind-backend'
    environmentId: acaEnvModule.outputs.environmentId
    acrLoginServer: acrModule.outputs.loginServer
    acrUsername: acrModule.outputs.acrAdminUsername
    acrPassword: acrModule.outputs.acrAdminPassword
    imageTag: imageTag
    dbHost: mysqlModule.outputs.fqdn
    dbName: mysqlModule.outputs.databaseName
    dbUsername: mysqlModule.outputs.adminLogin
    dbPassword: dbAdminPassword
    mlServiceUrl: mlServiceModule.outputs.internalUrl
    jwtSecret: jwtSecret
    enableExternalIngress: true
  }
}

// 6. React Frontend Dashboard
module frontendModule 'modules/frontend.bicep' = {
  name: 'frontendDeployment'
  params: {
    location: location
    appName: 'careermind-frontend'
    environmentId: acaEnvModule.outputs.environmentId
    acrLoginServer: acrModule.outputs.loginServer
    acrUsername: acrModule.outputs.acrAdminUsername
    acrPassword: acrModule.outputs.acrAdminPassword
    imageTag: imageTag
  }
  dependsOn: [
    backendModule
  ]
}

output acrLoginServer string = acrModule.outputs.loginServer
output mysqlHost string = mysqlModule.outputs.fqdn
output backendUrl string = 'https://${backendModule.outputs.fqdn}'
output frontendUrl string = frontendModule.outputs.url
output swaggerUrl string = 'https://${backendModule.outputs.fqdn}/swagger-ui.html'
