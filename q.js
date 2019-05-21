db.createUser({
  user: "m103-application-user",
  pwd: "m103-application-pass",
  roles: [{role: "readWrite", db: "applicationData"}]
})

db.createUser({
  user: "m103-admin",
  pwd: "m103-pass",
  roles: [{role: "root", db: "admin"}]
})