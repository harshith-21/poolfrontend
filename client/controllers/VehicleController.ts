import * as express from 'express';


import Controller from '../interfaces/IController';
import vehicle from '../schemas/Vehicle';

/**
 * Controller class for the user.
 * @TODO write functions for updating, deleting, and getting user.
 */
export default class VehicleController implements Controller {

    public path = '/vehicle';
    public router = express.Router();

    private userVehicle = vehicle;

    constructor() {
        this.initRoutes();
    }

    /**
     * Initialize all routes
     */
    public initRoutes() {

        this.router.post(`${this.path}/vehicleDetails`, this.getVehicle);

    }

    /**
     * New user sign up.
     * @TODO save encrypted passwords.
     */

    private getVehicle = (request: express.Request, response: express.Response) => {
        console.log('called getVehicle');
        console.log('request.body', request.body)
        console.log('helooooo');
        
        const userId = request.body.userId;
        console.log('userId', userId)
        // const emailID = loginData.emailID;

        this.userVehicle.findOne({ userId: userId }).then(async (founduser) => {
            if (founduser) {
                response.sendStatus(200);
                response.send(founduser);

            } else {
                console.log('user not found');
                response.sendStatus(404);
                response.send("not found")
            }
        });

        // return vechileDetails;
    }

 

}