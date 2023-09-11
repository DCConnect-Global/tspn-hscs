// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;


contract CommercialDAO {

    struct ServiceProvider {
        address _address;
        string _name;
        string _did;
        uint8 _nonce;
    }

    // did -> ServiceProvider
    mapping(string => ServiceProvider) public serviceProviderList;
    string public topicId;

    event ServiceProviderJoined(ServiceProvider _serviceProvider);
    event TopicIdSet(string _topicId);

    // TODO: Should inherit from Ownable to restrict only contract owner can insert SpDid or not
    // constructor() public {
    //     // Constructor code
    // }

    function grantMembership(ServiceProvider memory serviceProvider) public {
        serviceProvider._nonce = 1;
        serviceProviderList[serviceProvider._did] = serviceProvider;
        ServiceProvider memory newServiceProvider = serviceProviderList[serviceProvider._did];
        emit ServiceProviderJoined(newServiceProvider);
    }

    // TODO: Determine do we use getter function to make access modifier of public field to be private instead
    function getMember(string memory _did) public view returns (ServiceProvider memory) {
        require(serviceProviderList[_did]._nonce != 0, "Member does not exist");
        return serviceProviderList[_did];
    }

    function  isMember(string memory _did) public view returns (bool) {
        return serviceProviderList[_did]._nonce != 0;
    }

    function setTopicId( string memory _topicId) public {
        topicId = _topicId;
        emit TopicIdSet(_topicId);
    }

    function getTopicId() public view returns (string memory) {
        return topicId;
    }
}
