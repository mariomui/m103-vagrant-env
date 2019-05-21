# Mongo 203 Cluster Administraion

`brew cask install virtualbox`

`brew cask install vagrant`
* vagrant up 
uses the Vagrant file, check my git for it
provision-mongod also is there to run scripting. don't worry about it.
just run vagrant provision
or when you ran vagrant up tack on --provision to it
```
vagrant up --provision
```

vagrant ssh into it.
``
vagrant halt
vagrant status
## After sshing into it.

```
mongod
```

## commands

use admin (shutdown function only available using that database)
* lsof -i 
  * show all the listening demons
  * kill pid (if you wanna shut it down)
  * if you really mess up do , ps aux | grep mongo and then kill pids.
* `db.shutdownServer()`
  * shuts down mongod
  * shortcut so you dont have to go to use admin for it
    * `mongo admin --port <portno> --eval 'db.shutdownServer()'`

* `mongod help`
  * --port
    * specify path
  * --logpath
    * where they log info path
  * --dbpath
    * where databases go
  * --fork
    * tell mongod to be a background process
## commands: shell helpers
* db.<method>
  * User management
    * db.createUser
    * db.dropUser
    * at the database level
  * Database maanagment
    * db.dropDatabase()
    * db.dropCollection()
  * Database status
    * db.serverStatus()
* db.<collection>.<method>
  * Collection management
    * db.renameCollection
    * db.collection.createIndex()
    * db.createIndex()
    * db.collection.drop()
  * 
* 

## permissions
drwxr-xr-x
 ^^^***
d = direcotr
rwx = read write access execute for owner
r-x = read and execute for group
r-x = guest

111 = 7
101 = 5

## layers
### document model layer
* applying crud operations how they result
* management of namespaces, indexes defined per namespace, responds to requests, replication concerns
### storage layer
* all the persistncy, how data is stored on desk, what kind of files does it use, compression, such-such
* wiredtiger (default storage engine) LLSA
### security layer (traversal?)
* user management
* authentication
* network encryption
### admin layer (traversal?)
  * creating dbs
  * renaming collections
  * loggin infostructure

## Distributed Database System
* Replica Set
  * groups of mongodemons that share info
  * one node manages all reads and writes
    * secondary nodes constantly copy the master
  * Failover Protocol (RAFT)
    * Elect a secondary node and have it be master when master is infirm.

* Shards
  * They are replica sets (cluster)
  * Composed of Replicas, MongoS, and Config Servers
    * MongoS
      * shard cluster routing components
      * providing service to application
      * all services are routed through mongoS
    * Config
      * a special type of replica set
      * mapping of data
      * chunk meta data
      * which collection is distributed

## Mongo YAML
* Mongod or mongos startup options
* **necessary options for mongod**
  * --dbpath => storage.dbPath
  * --logpath => systemLog.path, systemLog.destination
  * --bind_ip => net.bindIp
    * network adapter on a host that provides access to the network otherwise mongod will only accept connections on the same host.
  * --replSet and keyFile  => replication.replSetName and security.keyFile
    * starts mongod with basic auth security and user authentication enabled
  * sslPEMKey, sslCaKey, sslMode => net.ssl.sslPEMKEY,net.ssl.sslCAKey, net.ssl.sslMode
    * some other bullhsit
  * fork => processManagement.fork
<details>
<summary><b>yaml file</b></summary>

mongod --config "etc/mongod.conf"
```yaml
storage:
  dbPath: /data/db
systemLog:
  path: "/data/log.mongod.log"
  destination: "file"
replication:
  replSetName: M103
net:
  bindIp : 127.0.0.1,192.168.0.100
ssl:
  mode: "requireSSL"
  PEMKeyFile: "/etc/ssl/ssl.pem"
  CAFile: "/etc/ssl/SSLCA.pem"
security:
  keyFile: "/data/keyfile"
processManagement:
  fork : true
  ```
  you should look at the conf i provided in mongodb.conf. much more updated.
</details>
  
## Gotchas
* 16 MB documents size limit
* in the storage layer, documents are stored as BSON
* in the client/application layer, its json.
* mongod --port 27000 --logpath <> --dbpath /data/db --auth --bind_ip 192.168.103.100,127.0.0.1 --fork
  * no spaces between the ips.
  * --fork has to b last and you'v gotta have a logpath
  * create admin
  * ```sql
    use admin
    db.createUser({
      user: "m103-admin",
      pwd: "m103-pass",
      roles: [
        {role: "root", db: "admin"}
      ]
    })
    ```
* Vagrant provides a way to execute a command over ssh instead of logging in, so for Linux host and guest you can use:

  * from host to guest:
  cat ~/file_on_host.txt | vagrant ssh -c 'cat - > ~/file_on_guest.txt'

  * from guest to host:
  vagrant ssh -c 'cat ~/file_on_guest.txt' > ~/file_on_host.txt
  
     *  -c executes the command
*  
* ```
  db.runCommand(
    { "createIndexes": <collection> },
    { "indexes": 
      [
        {
          "key": { "product": 1 }
        },
        { 
          "name": "name_index" 
        }
      ]
    }
  )
  ```
  
### Get profiling level:

mongo newDB --host 192.168.103.100:27000 -u m103-admin -p m103-pass --authenticationDatabase admin --eval '
  db.getProfilingLevel()
'
Set profiling level:

mongo newDB --host 192.168.103.100:27000 -u m103-admin -p m103-pass --authenticationDatabase admin --eval '
  db.setProfilingLevel(1)
'
Show collections:

mongo newDB --host 192.168.103.100:27000 -u m103-admin -p m103-pass --authenticationDatabase admin --eval '
  db.getCollectionNames()
'
Note: show collections only works from within the shell

Set slowms to 0:

mongo newDB --host 192.168.103.100:27000 -u m103-admin -p m103-pass --authenticationDatabase admin --eval '
  db.setProfilingLevel( 1, { slowms: 0 } )
'
Insert one document into a new collection:

mongo newDB --host 192.168.103.100:27000 -u m103-admin -p m103-pass --authenticationDatabase admin --eval '
  db.new_collection.insert( { "a": 1 } )
'
Get profiling data from system.profile:

mongo newDB --host 192.168.103.100:27000 -u m103-admin -p m103-pass --authenticationDatabase admin --eval '
  db.system.profile.find().pretty()
'
The command show collections no longer lists the system.* collections. It changed after version 4.0.

To list all of the collection names you can run this command:

db.runCommand({listCollections: 1})

## After creating super user
mongo admin -u root -p root123
Create security officer:

db.createUser(
  { user: "security_officer",
    pwd: "h3ll0th3r3",
    roles: [ { db: "admin", role: "userAdmin" } ]
  }
)
Create database administrator:

db.createUser(
  { user: "dba",
    pwd: "c1lynd3rs",
    roles: [ { db: "admin", role: "dbAdmin" } ]
  }
)
Grant role to user:

db.grantRolesToUser( "dba",  [ { db: "playground", role: "dbOwner"  } ] )
Show role privileges:

db.runCommand( { rolesInfo: { role: "dbOwner", db: "playground" }, showPrivileges: true} )

### Mongo tools
find /usr/bin/ -name "mongo*"
Create new dbpath and launch mongod:

mkdir -p ~/first_mongod
mongod --port 30000 --dbpath ~/first_mongod --logpath ~/first_mongod/mongodb.log --fork
Use mongostat to get stats on a running mongod process:

mongostat --help
mongostat --port 30000
Use mongodump to get a BSON dump of a MongoDB collection:

mongodump --help
mongodump --port 30000 --db applicationData --collection products
ls dump/applicationData/
cat dump/applicationData/products.metadata.json
Use mongorestore to restore a MongoDB collection from a BSON dump:

mongorestore --drop --port 30000 dump/
Use mongoexport to export a MongoDB collection to JSON or CSV (or stdout!):

mongoexport --help
mongoexport --port 30000 --db applicationData --collection products
mongoexport --port 30000 --db applicationData --collection products -o products.json
Tail the exported JSON file:

tail products.json
Use mongoimport to create a MongoDB collection from a JSON or CSV file:

mongoimport --port 30000 products.json


dirty % o dirty bytes in cache
used % currently used
vsize total amoutn o virtual memory used by process
res resident memory used in process
@placeholder
  
find /usr/bin/ -name "mongo*"
Create new dbpath and launch mongod:

mkdir -p ~/first_mongod
mongod --port 30000 --dbpath ~/first_mongod --logpath ~/first_mongod/mongodb.log --fork
Use mongostat to get stats on a running mongod process:

mongostat --help
mongostat --port 30000
Use mongodump to get a BSON dump of a MongoDB collection:

mongodump --help
mongodump --port 30000 --db applicationData --collection products
ls dump/applicationData/
cat dump/applicationData/products.metadata.json
Use mongorestore to restore a MongoDB collection from a BSON dump:

mongorestore --drop --port 30000 dump/
Use mongoexport to export a MongoDB collection to JSON or CSV (or stdout!):

mongoexport --help
mongoexport --port 30000 --db applicationData --collection products
mongoexport --port 30000 --db applicationData --collection products -o products.json
Tail the exported JSON file:

tail products.json
Use mongoimport to create a MongoDB collection from a JSON or CSV file:

mongoimport --port 30000 products.json

mongoimport --drop --port 27000 -u "m103-application-user" \
-p "m103-application-pass" --authenticationDatabase "admin" \
--db applicationData --collection products /dataset/products.json
We authenticate to the database the same way with mongoimport as we did with mongo. The flags --db and --collection are used to designate a target database and collection for our data. The flag --drop is used to drop the existing collection, so we don't create duplicates by running this command twice.
  