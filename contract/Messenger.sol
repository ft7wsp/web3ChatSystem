// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Messenger {
    struct Msgs {
        address from;
        string amsg;
    }

    Msgs[] public allMsgs;
    mapping(address => Msgs) public msgs;
    address[] public senders;
    address public test;

    event msgSent(address _from, string _amsg);

    constructor() {
        test = msg.sender;
    }

    function sendMsg(string memory _amsg) public {
        Msgs memory newMsg = Msgs(msg.sender, _amsg);
        allMsgs.push(newMsg);
        msgs[msg.sender] = newMsg;
        senders.push(msg.sender);
        emit msgSent(msg.sender, _amsg);
    }

    function getMsgs() public view returns (Msgs[] memory) {
        return allMsgs;
    }

    function sendersLength() public view returns (uint256) {
        return senders.length;
    }
}
