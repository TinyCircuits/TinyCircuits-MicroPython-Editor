import PocketBase from 'pocketbase'


class User extends PocketBase{
    constructor(){
        let pb = super('http://127.0.0.1:8090');
        this.pb = pb;
    }


    // Returns `true` if the user is logged in, `false` otherwise
    loggedIn = () => {
        return this.pb.authStore.isValid;
    }
}


export default User;