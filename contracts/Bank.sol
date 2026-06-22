// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Bank {
    mapping(address => uint256) private balances;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    
    event Transferred(address indexed from, address indexed to, uint256 amount);

    function deposit() external payable {
        require(msg.value > 0, "Lượng tiền gửi phải lớn hơn 0");

        balances[msg.sender] += msg.value;

        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "Lượng tiền rút phải lớn hơn 0");
        require(balances[msg.sender] >= amount, "Số dư không đủ");

        balances[msg.sender] -= amount;

        payable(msg.sender).transfer(amount);

        emit Withdrawn(msg.sender, amount);
    }

    function transfer(address to, uint256 amount) external {

        require(to != address(0), "Không thể chuyển tiền tới địa chỉ rỗng");
        require(to != msg.sender, "Không thể tự chuyển tiền cho bản thân");
        require(amount > 0, "Lượng tiền chuyển phải lớn hơn 0");
        
        require(balances[msg.sender] >= amount, "Số dư không đủ");
        balances[msg.sender] -= amount;

        balances[to] += amount;
        emit Transferred(msg.sender, to, amount);
    }

    function getMyBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}