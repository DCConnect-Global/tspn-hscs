// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9 <0.9.0;

contract CommercialDAO {

    mapping(address => string) public spDidList;
    mapping(address => string) public topicIdList;

    event SpDidSet(address indexed _address, string _spDid);
    event TopicIdSet(address indexed _address, string _topicId);

    // TODO: Should inherit from Ownable to restrict only constract owner can insert SpDid or not
    // constructor() public {
    //     // Constructor code
    // }

    function setSpDid(address _address, string memory _spDid) public {
        spDidList[_address] = _spDid;
        emit SpDidSet(_address, _spDid);
    }

    // TODO: Determine do we use getter function to make access modifier of public field to be private instead
    function getSpDid(address _address) public view returns (string memory) {
        return spDidList[_address];
    }

    function setTopicId(address _address, string memory _topicId) public {
        topicIdList[_address] = _topicId;
        emit TopicIdSet(_address, _topicId);
    }

    function getTopicId(address _address) public view returns (string memory) {
        return topicIdList[_address];
    }
}
