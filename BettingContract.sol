pragma solidity ^0.8.0; //SPDX-License-Identifier: UNLICENSED

contract bettingSpace {
    event newEvent(
        uint indexed eventId,
        address creator,
        uint entryFee,
        uint startingTime,
        uint endingTime
    );

    event newBit(uint indexed eventId, address bittor, uint teamId);

    event newTeam(uint indexed teamId, string indexed teamName);

    event EventResult(uint indexed eventID, uint winnerTeamId);

    // struct for saving details of bettings event
    struct bettingEventDetails {
        address creator;
        string eventName;
        uint eventStartTime;
        uint eventEndTime;
        uint entryFee;
        uint team1Id;
        uint team2Id;
        uint totalAmountCollected;
        bool hasDistributedAmount;
        bool hasDeclaredWinner;
        uint winnerId;
    }

    struct bettorDetails {
        address bittorAddress;
        bool hasBetted;
        uint teamId;
    }

    struct teamDetails {
        string teamName;
        uint teamId;
    }
    // from event id to struct of bittorDetails
    mapping(uint => bettorDetails[]) eventBettorsDetails;
    // from event id to user
    mapping(uint => mapping(address => bool)) hasBitted;

    bettingEventDetails[] public bettings;

    teamDetails[] teams;

    address owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    modifier onlyCreatorOfEvent(uint eventId) {
        require(
            msg.sender == bettings[eventId].creator,
            "only event creator can exist or invalid id"
        );
        _;
    }

    modifier validEventId(uint eventId) {
        require(eventId < bettings.length, "invalid event id");
        _;
    }

    modifier validTeamId(uint teamId) {
        require(teamId < teams.length, "invalid team id");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev is to get team name through team id
     * @param _teamId for which id of
     */
    function getTeamName(uint _teamId) external view returns (string memory) {
        require(_teamId < teams.length);
        return teams[_teamId].teamName;
    }

    /**
     * @dev is for making bit to an existing event
     * @param _bettingEventId is for providing event id
     * @param _teamIdToBit is for which to bet on
     */
    function makeBet(uint _bettingEventId, uint _teamIdToBit)
        external
        payable
        validEventId(_bettingEventId)
        returns (bool)
    {
        require(!hasBitted[_bettingEventId][msg.sender], "can only bit once");
        require(
            msg.sender != bettings[_bettingEventId].creator,
            "event creator cannot bit"
        );
        require(msg.sender != owner, "contract owner cannot bit");
        require(
            _teamIdToBit == bettings[_bettingEventId].team1Id ||
                _teamIdToBit == bettings[_bettingEventId].team2Id,
            "invalid team id choosen"
        );
        require(
            bettings[_bettingEventId].eventStartTime <= block.timestamp,
            "Event not yet started"
        );
        require(
            bettings[_bettingEventId].eventEndTime > block.timestamp,
            "Event ended"
        );
        require(
            msg.value >= bettings[_bettingEventId].entryFee,
            "insufficient value recevied"
        );

        eventBettorsDetails[_bettingEventId].push(
            bettorDetails(msg.sender, true, _teamIdToBit)
        );

        hasBitted[_bettingEventId][msg.sender] = true;

        bettings[_bettingEventId].totalAmountCollected += bettings[
            _bettingEventId
        ].entryFee;

        emit newBit(_bettingEventId, msg.sender, _teamIdToBit);

        return true;
    }

    /**
     * @dev to create new team
     * @param _teamName is for new team name
     * @return teamId of new team
     */
    function createTeam(string memory _teamName)
        external
        returns (uint teamId)
    {
        require(bytes(_teamName).length != 0, "invalid team name");

        teams.push(teamDetails(_teamName, teams.length));
        teamId = teams.length - 1;
        emit newTeam(teamId, _teamName);
    }

    /**
     * @dev is for create new event by anyone
     * @param _eventName is for name of event
     * @param _team0Id is for team id
     * @param _team1Id is for team id
     * @param _entryFee is for fee amount to set for this event
     * @param _startTime is for startig time of the event
     * @param _endTime is for ending time of the event
     */
    function createBettingEvent(
        string memory _eventName,
        uint _team0Id,
        uint _team1Id,
        uint _entryFee,
        uint _startTime,
        uint _endTime
    ) external validTeamId(_team0Id) validTeamId(_team1Id) returns (bool) {
        require(_team0Id != _team1Id, "team id cannot be same");
        require(
            _startTime >= block.timestamp,
            "starting time should be greater than current time"
        );
        require(_endTime > block.timestamp, "invalid ending time");
        require(
            _startTime != _endTime,
            "start time and end time cannot be same"
        );
        require(bytes(_eventName).length != 0, "invalid event name");
        require(msg.sender != owner, "owner cannot create betting event");

        bettings.push(
            bettingEventDetails(
                msg.sender,
                _eventName,
                _startTime,
                _endTime,
                _entryFee,
                _team0Id,
                _team1Id,
                0,
                false,
                false,
                0
            )
        );

        emit newEvent(
            bettings.length - 1,
            msg.sender,
            _entryFee,
            _startTime,
            _endTime
        );

        return true;
    }

    /**
     * @dev to declare result when the event has ended, can only be done by creator of event
     */
    function declareResultOfEvent(uint _eventId, uint winnerTeamId)
        external
        onlyCreatorOfEvent(_eventId)
    {
        require(
            block.timestamp > bettings[_eventId].eventEndTime,
            "event not yet ended"
        );
        require(
            winnerTeamId == bettings[_eventId].team1Id ||
                winnerTeamId == bettings[_eventId].team2Id,
            "invalid id"
        );

        bettings[_eventId].hasDeclaredWinner = true;
        bettings[_eventId].winnerId = winnerTeamId;

        emit EventResult(_eventId, winnerTeamId);
    }

    /**
     * @dev to distribute event amount after the result is declared
     * @
     */
    function DistributeEventAmount(uint _eventId)
        external
        onlyOwner
        validEventId(_eventId)
    {
        require(
            !bettings[_eventId].hasDistributedAmount,
            "already distributed"
        );
        require(
            bettings[_eventId].eventEndTime < block.timestamp,
            "Event not yet ended"
        );
        require(
            bettings[_eventId].hasDeclaredWinner,
            "winner not yet declared"
        );
        uint amount = calculateWinnersAndAmount(_eventId);

        for (uint i = 0; i < eventBettorsDetails[_eventId].length; i++) {
            address user = eventBettorsDetails[_eventId][i].bittorAddress;
            if (
                eventBettorsDetails[_eventId][i].teamId ==
                bettings[_eventId].winnerId
            ) {
                (bool sent, ) = user.call{value: amount}("");
                require(sent, "eth transfer failed");
            }
        }

        bettings[_eventId].hasDistributedAmount = true;
    }

    function calculateWinnersAndAmount(uint _eventId)
        internal
        view
        returns (uint amountPerWinnerUser)
    {
        uint winnerID = bettings[_eventId].winnerId;
        uint winnerCount = 0;
        for (uint i = 0; i < eventBettorsDetails[_eventId].length; i++) {
            if (eventBettorsDetails[_eventId][i].teamId == winnerID) {
                winnerCount++;
            }
        }
        amountPerWinnerUser =
            bettings[_eventId].totalAmountCollected /
            winnerCount;
    }
}