@description('Location for MySQL Server')
param location string = resourceGroup().location

@description('MySQL Server Name')
param serverName string

@description('MySQL Admin Username')
param adminLogin string = 'careermind'

@description('MySQL Admin Password')
@secure()
param adminPassword string

@description('Database Name')
param databaseName string = 'careermind_db'

@description('Compute SKU for MySQL Flexible Server')
param skuName string = 'Standard_B1ms'

@description('MySQL Version')
param version string = '8.0.21'

resource mysqlServer 'Microsoft.DBforMySQL/flexibleServers@2023-12-30' = {
  name: serverName
  location: location
  sku: {
    name: skuName
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: adminLogin
    administratorLoginPassword: adminPassword
    version: version
    storage: {
      storageSizeGB: 20
      iops: 360
      autoGrow: 'Enabled'
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

// Allow Azure services to access MySQL server
resource firewallRuleAzure 'Microsoft.DBforMySQL/flexibleServers/firewallRules@2023-12-30' = {
  parent: mysqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Create initial application database
resource database 'Microsoft.DBforMySQL/flexibleServers/databases@2023-12-30' = {
  parent: mysqlServer
  name: databaseName
  properties: {
    charset: 'utf8mb4'
    collation: 'utf8mb4_unicode_ci'
  }
}

output fqdn string = mysqlServer.properties.fullyQualifiedDomainName
output adminLogin string = adminLogin
output databaseName string = databaseName
