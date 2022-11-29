# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## 
# Betting Contract

An smart contract which lets you create betting event for and let other user bet on it, and then distribute price to winners.

## Coverage
![Alt text](images/coverage1.png "Title")

## Installation 
to install all the dependencies
```bash
npm install
```

## Explanation
1) #### Events
   - `newEvent` is emitted when new event is created
   - `newBit` is emitted when some bit on event
   - `newTeam` is emitted when some created a new team
   - `eventResult` is emitted when event is ended and result is declared by creator
 
2) #### State Variables
   - struct `bettingEventDetails` & `bettings` array is use to store betting event details
   - struct `bettorDetails` & `eventBettorsDetails` mapping is use to store bettor details when they bit on events.
   - struct `teamDetails` & `teams` array is use to store details of teams
   - mapping `hasBitted` is change when user bet on event so that it cannot bet again
   - address `owner` stores address of owner
3) ### modifiers
   - `onlyOwner` allows only owner to access that function
   - `onlyCreatorOfEvent` allows only creator of that event to access that function
   - `validEventId` check that event id is valid or not
   - `validTeamId` check that team id is valid or not
4) ### constructor
   - it store the deployers address in `owner` variable

5) ### functions
   - `getTeamName` getter function which takes in `teamId` to retrieve team name
   - `makeBet` function allows any users to bit on running betting event other than creator and owner of contract
   - `createTeam` function lets any user to create new team and will return `teamId`
   - `createBettingEvent`  function allows any one to create event to let other users bet on it when the event gets started, only owner of the contract cannot create an betting event
   - `declareResultOfEvent` function only allows creator of event to declare result of event after events gets over
   - `DistributeEventAmount`function only allows owner of the contract to distribute total amount equally to winner of the specific event
   - `calculateWinnersAndAmount` an internal function use to calculate the equal distributed amount

## Hardhat

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help // to see all the option
npx hardhat test // to run test
GAS_REPORT=true npx hardhat test // running test with gasg report
npx hardhat node // to start localnode 
npx hardhat run scripts/deploy.js // deploy contract
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)