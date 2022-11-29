const { time, loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require("chai");
const { ethers } = require('hardhat');

describe("Betting Contract", () => {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deployBettingFixture() {

        const [addr1,addr2,addr3,addr4] = await ethers.getSigners();

        const Betting = await ethers.getContractFactory("bettingSpace");
        const betting = await Betting.deploy();

        return {betting, addr1, addr2, addr3, addr4}
    }

    describe("Deployment", () => {
        it("it should set the right owner", async () => {
            const { addr1, addr2, betting} = await loadFixture(deployBettingFixture);

            expect(await betting.owner()).to.equal(addr1.address);
        })
    })
    describe("creating teams", () => {
        it("should revert for empty team name", async () => {
            const { addr1, addr2, betting} = await loadFixture(deployBettingFixture);

            // const createTeam = await betting.connect(addr1).createTeam("team1");
            // createTeam.wait();
            await expect(betting.createTeam("")).to.revertedWith("invalid team name");
        });
        it("should be the first team of the contract",async () => {
            const {addr1,addr2, betting} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            expect(await betting.getTeamName(0)).to.equal("team1");
        });
    });
    describe("creating betting event", () => {
        it("should revert error for owner of contract creating an event", async () => {
            const {addr1, betting} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 20;
            const endTime = (await time.latest()) + 200 ; 

            await expect(betting.createBettingEvent(
                "first event 1",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            )).to.revertedWith("owner cannot create betting event");
        });
        it("should revert error for empty event name", async () => {
            const {betting, addr1, addr2} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 20;
            const endTime = (await time.latest()) + 200 ; 

            await expect(betting.connect(addr2).createBettingEvent(
                "",
                0,
                1,
                ethers.utils.parseEther("0.1"),
                startTime,
                endTime
            )).to.revertedWith("invalid event name");
        });
        it("should revert error for invalid id or id which does not exist", async () => {
            const { addr1, addr2, betting } = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 20;
            const endTime = (await time.latest()) + 200 ; 

            await expect(betting.connect(addr2).createBettingEvent(
                "first event 1",
                4,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            )).to.revertedWith("invalid team id");
        });
        it("should revert error for same team id ", async () => {
            const {betting, addr1, addr2} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 20;
            const endTime = (await time.latest()) + 200 ; 

            await expect(betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                0,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            )).to.revertedWith("team id cannot be same");
        });
        it("should revert error for startTime less then block time or invalid value", async () => {
            const {betting, addr1, addr2} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) - 20;
            const endTime = (await time.latest()) + 200 ; 

            await expect(betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            )).to.revertedWith("starting time should be greater than current time");
        });
        it("should revert error for invalid endTime or endTime is less than current blocktime", async () => {
            const {betting, addr1, addr2} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 20;
            const endTime = (await time.latest()) - 200 ; 

            await expect(betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            )).to.revertedWith("invalid ending time");
        });
        it("should revert error for identical start and end time", async () => {
            const {betting, addr1, addr2} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 20;
            const endTime = (await time.latest()) + 20 ; 

            await expect(betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            )).to.revertedWith("start time and end time cannot be same");
        });
        it("should be the first event of the contract", async () => {
            const {betting, addr1, addr2} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 20;
            const endTime = (await time.latest()) + 200 ; 

            const createEvent = await betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            );
            createEvent.wait();
        
            const checkEventDetails = await betting.bettings(0);
            expect(checkEventDetails.eventName).to.equal("first event");
        });
    });
    describe("making bet on events", () => {
        it("should revert if owner of contract or creator of event try to make a bit", async () => {
            const {betting, addr1, addr2} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 1 ;
            const endTime = (await time.latest()) + 100 ; 

            const createEvent = await betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            );
            createEvent.wait();

            await expect(betting.makeBet(0,1)).to.revertedWith("contract owner cannot bit");
            await expect(betting.connect(addr2).makeBet(0,1)).to.revertedWith("event creator cannot bit");
        });
        it("should revert error if user bit more than one time", async () => {
            const {betting, addr1, addr2, addr3} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 1 ;
            const endTime = (await time.latest()) + 100 ; 

            const createEvent = await betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            );
            createEvent.wait();

            const makeBit = await betting.connect(addr3).makeBet(0,1,{value: ethers.utils.parseEther("1.0")});

            await expect(betting.connect(addr3).makeBet(0,0,{value: ethers.utils.parseEther("1.0")})).to.revertedWith("can only bit once");
        });
        it("should revert error if invalid team id is provided", async () => {
            const {betting, addr1, addr2, addr3} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 1 ;
            const endTime = (await time.latest()) + 100 ; 

            const createEvent = await betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            );
            createEvent.wait();

            await expect(betting.connect(addr3).makeBet(0,2,{value: ethers.utils.parseEther("1.0")})).to.revertedWith("invalid team id choosen");
        });
        it("should revert error if invalid event id is provided", async () => {
            const {betting, addr1, addr2, addr3} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 1 ;
            const endTime = (await time.latest()) + 100 ; 

            const createEvent = await betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            );
            createEvent.wait();

            await expect(betting.connect(addr3).makeBet(1,0,{value: ethers.utils.parseEther("1.0")})).to.revertedWith("invalid event id");
        });
        it("should revert error if event is not yet started", async () => {
            const {betting, addr1, addr2, addr3} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 100 ;
            const endTime = (await time.latest()) + 200 ; 

            const createEvent = await betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            );
            createEvent.wait();

            await expect(betting.connect(addr3).makeBet(0, 0, {value: ethers.utils.parseEther("1.0")})).to.revertedWith("Event not yet started");
        });
        it("should revert error if event has ended", async () => {
            const {betting, addr1, addr2, addr3} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 1 ;
            const endTime = (await time.latest()) + 100 ; 

            const createEvent = await betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            );
            createEvent.wait();

            time.increase(100);

            await expect(betting.connect(addr3).makeBet(0, 0, {value: ethers.utils.parseEther("1.0")})).to.revertedWith("Event ended");
        });
        it("should revert error if less eth is sended than entryfee", async () => {
            const {betting, addr1, addr2, addr3} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 1 ;
            const endTime = (await time.latest()) + 100 ; 

            const createEvent = await betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            );
            createEvent.wait();

            await expect(betting.connect(addr3).makeBet(0, 0, {value: ethers.utils.parseEther("0.5")})).to.revertedWith("insufficient value recevied");
        });
        it("should succesfully make trasaction if everything is correct", async () => {
            const {betting, addr1, addr2, addr3} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 1 ;
            const endTime = (await time.latest()) + 100 ; 

            const createEvent = await betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            );
            createEvent.wait();

            const makeBit = await betting.connect(addr3).makeBet(0, 1, {value: ethers.utils.parseEther("1.0")});
            makeBit.wait();
            expect(makeBit.hash).to.not.equal("");
        })
    })
    describe("Declaring result of event", () => {
        it("should only allow creator of event and throw erorr other than that or invalid id provided", async () => {
            const {betting, addr1, addr2} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 1 ;
            const endTime = (await time.latest()) + 100 ; 

            const createEvent = await betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            );
            createEvent.wait();

            //console.log("start time : ",startTime);
            //console.log("endTime : ",endTime);
            //console.log("latest time : ",await time.latest());
            //console.log("update time : ",await time.increaseTo(1664098100));

            await expect(betting.declareResultOfEvent(0,1)).to.revertedWith("only event creator can exist or invalid id");
        });
        it("should revert error if the endTime is greater than current block.timestamp", async () => {
            const {betting, addr1, addr2} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 1 ;
            const endTime = (await time.latest()) + 300 ; 

            const createEvent = await betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            );
            createEvent.wait();

            await expect(betting.connect(addr2).declareResultOfEvent(0,1)).to.revertedWith("event not yet ended");
        });

        it("should revert if `winnerTeamId` has invalid value other than the 2 teams", async () => {
            const {betting, addr1, addr2} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 1 ;
            const endTime = (await time.latest()) + 100 ; 
            

            const createEvent = await betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            );
            createEvent.wait();

            time.increase(100);

            await expect(betting.connect(addr2).declareResultOfEvent(0,3)).to.revertedWith("invalid id");
        });
        it("should declare event successfully", async () => {
            const {betting, addr1, addr2} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 1 ;
            const endTime = (await time.latest()) + 100 ; 
            

            const createEvent = await betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            );
            createEvent.wait();

            time.increase(100);

            const declareWinner = await betting.connect(addr2).declareResultOfEvent(0,1);
            declareWinner.wait();
            expect(declareWinner.hash).to.not.equal('')
        })
    })
    describe("destibuting event amount", () => {
        it("should allow only owner of the contract to access this function", async () => {
            const {betting, addr1, addr2} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 1 ;
            const endTime = (await time.latest()) + 100 ; 
            
            const createEvent = await betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            );
            createEvent.wait();

            time.increase(100);

            const declareWinner = await betting.connect(addr2).declareResultOfEvent(0,1);
            declareWinner.wait();

            await expect(betting.connect(addr2).DistributeEventAmount(0)).to.revertedWith("only owner");
        });
        it("should revert error if invalid event id is provided", async () => {
            const {betting, addr1, addr2} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 1 ;
            const endTime = (await time.latest()) + 100 ; 
            
            const createEvent = await betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            );
            createEvent.wait();

            time.increase(100);

            const declareWinner = await betting.connect(addr2).declareResultOfEvent(0,1);
            declareWinner.wait();

            await expect(betting.DistributeEventAmount(1)).to.revertedWith("invalid event id");
        });
        it("should revert error if event is not yet ended",async () => {
            const {betting, addr1, addr2} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 1 ;
            const endTime = (await time.latest()) + 100 ; 
            
            const createEvent = await betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            );
            createEvent.wait();

            await expect(betting.DistributeEventAmount(0)).to.revertedWith("Event not yet ended");
        });
        it("should revert error if winner is not yet declared", async () => {
            const {betting, addr1, addr2} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 1 ;
            const endTime = (await time.latest()) + 100 ; 
            
            const createEvent = await betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            );
            createEvent.wait();

            await time.increase(100);

            await expect(betting.DistributeEventAmount(0)).to.revertedWith("winner not yet declared");
        });
        it("should revert error if event price has already distributed",async () => {
            const {betting, addr1, addr2, addr3, addr4} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 1 ;
            const endTime = (await time.latest()) + 100 ; 
            
            const createEvent = await betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            );
            createEvent.wait();

            const makeBit = await betting.connect(addr3).makeBet(0, 1, {value: ethers.utils.parseEther("1.0")});
            makeBit.wait();

            const makeBit2 = await betting.connect(addr4).makeBet(0,0, {value: ethers.utils.parseEther("1.0")});
            makeBit2.wait();

            time.increase(100);

            const declareWinner = await betting.connect(addr2).declareResultOfEvent(0,1);
            declareWinner.wait();

            const distributeAmount = await betting.DistributeEventAmount(0);
            distributeAmount.wait();

            await expect(betting.DistributeEventAmount(0)).to.be.revertedWith("already distributed");
        })
        it("should revert error if no winner is there",async () => {
            const {betting, addr1, addr2, addr3, addr4} = await loadFixture(deployBettingFixture);

            const team1 = await betting.createTeam("team1");
            team1.wait();

            const team2 = await betting.createTeam("team2");
            team2.wait();

            const startTime = (await time.latest()) + 1 ;
            const endTime = (await time.latest()) + 100 ; 
            
            const createEvent = await betting.connect(addr2).createBettingEvent(
                "first event",
                0,
                1,
                ethers.utils.parseEther("1.0"),
                startTime,
                endTime
            );
            createEvent.wait();

            const makeBit = await betting.connect(addr3).makeBet(0, 1, {value: ethers.utils.parseEther("1.0")});
            makeBit.wait();

            time.increase(100);

            const declareWinner = await betting.connect(addr2).declareResultOfEvent(0,0);
            declareWinner.wait();

            await expect(betting.DistributeEventAmount(0)).to.be.revertedWith("no winners");

        })
    })
})