const userErrorHandler = (error) =>{
    console.log(error)
    if (error.includes('username: Path `username` is required')){
        return {error:'Username is requred',status:401}
    }
    if (error.includes('email: Path `email` is required')) {
        return {error:'Email is requred',status:401}
    }
    if (error.includes('password: Path `password` is required.')){
        return {error:'Password is requred',status:401}
    }
    if (error.includes('full_name: Path `full_name` is required.')) {
        return {error:'Full Name is requred',status:401}
    }
    if (error.includes('E11000 duplicate key error collection: test-api.users index: email_1 dup key:')) {
        return {error:'Email is already registered',status:401}
    }

    return {error:e.message,status:404}
}
const testErrorHandler = (error) =>{
    console.log(error)
    return 'Something went Wrong'
}

module.exports = {
    userErrorHandler,
    testErrorHandler
}