const contractAddress = '0x370cD2F4eE13484D4A39267F76a50CBc1b93b12a';

task("donate", "--CUSTOM-- Send donation to the fund")
    .addParam("amount", "Ether amount")
    .setAction(async function ({ amount }, { ethers }) {
        const Donation = await ethers.getContractAt("Donation", contractAddress)
        const [sender] = await ethers.getSigners();
        await (await Donation.connect(sender).gatherDonation({
            value: ethers.utils.parseEther(amount)
        })).wait()
        console.log(`${sender.address} has donated ${amount} Ether`);
    });

task("getDonators", "--CUSTOM-- Display the list of all donators")
    .setAction(async function ( _, { ethers }) {
        const Donation = await ethers.getContractAt("Donation", contractAddress)
        const donators = await Donation.getDonators();
        console.log(`${donators} have donated to the fund`);
    });

task("getDonation", "--CUSTOM-- Display the amount donated for the address")
    .addParam("address", "Donator address")    
    .setAction(async function ( { address }, { ethers }) {
        const Donation = await ethers.getContractAt("Donation", contractAddress)
        const amount = await Donation.getDonation(address);
        console.log(`${address} has donated ${ethers.utils.formatEther(amount)} Ether to the fund`);
    });

task("withdraw", "--CUSTOM-- Withdraw tokens from the fund to a specific address")
    .addParam("amount", "Ether amount")
    .addParam("receiver", "Receiver address") 
    .setAction(async function ({ amount, receiver }, { ethers }) {
        const Donation = await ethers.getContractAt("Donation", contractAddress)
        const [sender] = await ethers.getSigners();
        await Donation.connect(sender).withdraw(receiver, ethers.utils.parseEther(amount))
        console.log(`The owner withdrew ${amount} Ether to ${receiver}`);
    });