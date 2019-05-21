db.createUser({
  user: "m103-application-user",
  pwd: "m103-application-pass",
  roles: [{role: "readWrite", db: "applicationData"}]
})