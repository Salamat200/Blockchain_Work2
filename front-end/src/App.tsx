import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Use YOUR contract's ABI - this is the exact one from your deployment
const contractABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "initialOwner",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "FirstElementsPaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "FundsWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "LastElementsPaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "firstNumElements",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getFullArray",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastNumElements",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "num",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_newNum",
        "type": "uint256"
      }
    ],
    "name": "updateNumber",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "wordsArray",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// YOUR contract address
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('');
  const [contract, setContract] = useState<any>(null);
  const [owner, setOwner] = useState('');
  const [num, setNum] = useState(0);
  const [contractBalance, setContractBalance] = useState('');
  const [newNum, setNewNum] = useState('');
  const [sliceResult, setSliceResult] = useState<string[]>([]);
  const [allWords, setAllWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState('');
  
  // Input fields for slice operations
  const [firstNumInput, setFirstNumInput] = useState('');
  const [lastNumInput, setLastNumInput] = useState('');

  useEffect(() => {
    if (account && contract) {
      loadContractData();
    }
  }, [contract]);

  const connectWallet = async () => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userBalance = await provider.getBalance(accounts[0]);
        setBalance(ethers.formatEther(userBalance));
        
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contractInstance);
      }
      
    } catch (error: any) {
      console.error('Connection error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadContractData = async () => {
    if (!contract) return;
    
    try {
      const [contractOwner, currentNum, contractBal, words] = await Promise.all([
        contract.owner(),
        contract.num(),
        contract.getContractBalance(),
        contract.getFullArray()
      ]);
      
      setOwner(contractOwner);
      setNum(Number(currentNum));
      setContractBalance(ethers.formatEther(contractBal));
      setAllWords(words);
      
    } catch (error) {
      console.error('Error loading contract data:', error);
    }
  };

  const callFirstNumElements = async () => {
    if (!contract) return;
    
    const inputNum = parseInt(firstNumInput);
    if (isNaN(inputNum) || inputNum < 0 || inputNum > allWords.length) {
      alert(`Please enter a valid number between 0 and ${allWords.length}`);
      return;
    }

    setTransactionLoading('firstNumElements');
    try {
      // First update the num value in contract
      const updateTx = await contract.updateNumber(inputNum);
      await updateTx.wait();
      
      // Then call the firstNumElements function
      const tx = await contract.firstNumElements({ 
        value: ethers.parseEther("0.001") 
      });
      await tx.wait();
      
      // Get the result using static call
      const result = await contract.firstNumElements.staticCall({ 
        value: ethers.parseEther("0.001") 
      });
      setSliceResult(result);
      
      await updateBalances();
      await loadContractData();
      
    } catch (error: any) {
      console.error('Error:', error);
      alert(`Error: ${error.reason || error.message}`);
    } finally {
      setTransactionLoading('');
    }
  };

  const callLastNumElements = async () => {
    if (!contract) return;
    
    const inputNum = parseInt(lastNumInput);
    if (isNaN(inputNum) || inputNum < 0 || inputNum > allWords.length) {
      alert(`Please enter a valid number between 0 and ${allWords.length}`);
      return;
    }

    setTransactionLoading('lastNumElements');
    try {
      // First update the num value in contract
      const updateTx = await contract.updateNumber(inputNum);
      await updateTx.wait();
      
      // Then call the lastNumElements function
      const tx = await contract.lastNumElements({ 
        value: ethers.parseEther("0.002") 
      });
      await tx.wait();
      
      // Get the result using static call
      const result = await contract.lastNumElements.staticCall({ 
        value: ethers.parseEther("0.002") 
      });
      setSliceResult(result);
      
      await updateBalances();
      await loadContractData();
      
    } catch (error: any) {
      console.error('Error:', error);
      alert(`Error: ${error.reason || error.message}`);
    } finally {
      setTransactionLoading('');
    }
  };

  const updateNum = async () => {
    if (!contract) return;
    
    const numValue = parseInt(newNum);
    if (isNaN(numValue) || numValue < 0 || numValue > allWords.length) {
      alert(`Please enter a valid number between 0 and ${allWords.length}`);
      return;
    }

    setTransactionLoading('updateNumber');
    try {
      const tx = await contract.updateNumber(numValue);
      await tx.wait();
      
      setNum(numValue);
      setNewNum('');
      alert('Number updated successfully!');
      
      await loadContractData();
      
    } catch (error: any) {
      console.error('Error:', error);
      alert(`Error: ${error.reason || 'Sorry only the contract owner can update the number'}`);
    } finally {
      setTransactionLoading('');
    }
  };

  const withdrawFunds = async () => {
    if (!contract) return;
    
    setTransactionLoading('withdraw');
    try {
      const tx = await contract.withdrawFunds();
      await tx.wait();
      
      alert('Funds withdrawn successfully!');
      await updateBalances();
      
    } catch (error: any) {
      console.error('Error:', error);
      alert(`Error: ${error.reason || 'Sorry only the contract owner can withdraw funds'}`);
    } finally {
      setTransactionLoading('');
    }
  };

  const updateBalances = async () => {
    if (contract && account) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const userBalance = await provider.getBalance(account);
        setBalance(ethers.formatEther(userBalance));

        const contractBal = await contract.getContractBalance();
        setContractBalance(ethers.formatEther(contractBal));
      } catch (error) {
        console.error('Error updating balances:', error);
      }
    }
  };

  const isOwner = account.toLowerCase() === owner.toLowerCase();

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '900px', 
      margin: '0 auto',
      backgroundColor: '#0f172a',
      color: 'white',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ 
          color: '#60a5fa',
          fontSize: '2.5rem',
          marginBottom: '10px',
          background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Array Slicing DApp
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
          Interactive blockchain array operations with payable functions
        </p>
      </div>

      {!account ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155'
        }}>
          <h2 style={{ color: '#e2e8f0', marginBottom: '20px' }}>Connect Your Wallet</h2>
          <button 
            onClick={connectWallet} 
            disabled={loading}
            style={{ 
              padding: '15px 30px', 
              fontSize: '18px', 
              backgroundColor: loading ? '#475569' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
          >
            {loading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
          <p style={{ marginTop: '15px', color: '#94a3b8' }}>
            Make sure you're connected to <strong style={{color: '#60a5fa'}}>Localhost 8545</strong>
          </p>
        </div>
      ) : (
        <div>
          {/* Account Information Card */}
          <div style={{
            backgroundColor: '#1e293b',
            padding: '25px',
            borderRadius: '12px',
            marginBottom: '25px',
            border: '1px solid #334155',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ color: '#e2e8f0', marginTop: 0, marginBottom: '20px' }}>🔗 Account Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <p style={{ margin: '8px 0', color: '#cbd5e1' }}><strong>Your Address:</strong></p>
                <p style={{ margin: '8px 0', color: '#60a5fa', fontFamily: 'monospace', fontSize:'0.85rem', wordBreak: 'break-all', lineHeight: '1.4'}}>
                  {account}
                </p>
              </div>
              <div>
                <p style={{ margin: '8px 0', color: '#cbd5e1' }}><strong>Your Balance:</strong></p>
                <p style={{ margin: '8px 0', color: '#10b981', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {parseFloat(balance).toFixed(4)} ETH
                </p>
              </div>
              <div>
                <p style={{ margin: '8px 0', color: '#cbd5e1' }}><strong>Contract Owner:</strong></p>
                <p style={{ margin: '8px 0', color: '#f59e0b', fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all', lineHeight: '1.4' }}>
                  {owner}
                </p>
              </div>
              <div>
                <p style={{ margin: '8px 0', color: '#cbd5e1' }}><strong>Owner Status:</strong></p>
                <p style={{
                  margin: '8px 0',
                  color: isOwner ? '#10b981' : '#ef4444',
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}>
                  {isOwner ? '✅ You are the owner' : '❌ Not the owner'}
                </p>
              </div>
            </div>
          </div>

          {/* Contract Information Card */}
          <div style={{ 
            backgroundColor: '#1e293b', 
            padding: '25px', 
            borderRadius: '12px', 
            marginBottom: '25px',
            border: '1px solid #334155'
          }}>
            <h2 style={{ color: '#e2e8f0', marginTop: 0, marginBottom: '20px' }}>📊 Contract Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <p style={{ margin: '8px 0', color: '#cbd5e1' }}><strong>Current Num Value:</strong></p>
                <p style={{ margin: '8px 0', color: '#f59e0b', fontSize: '1.2rem', fontWeight: 'bold' }}>{num}</p>
              </div>
              <div>
                <p style={{ margin: '8px 0', color: '#cbd5e1' }}><strong>Contract Balance:</strong></p>
                <p style={{ margin: '8px 0', color: '#10b981', fontSize: '1.2rem', fontWeight: 'bold' }}>{parseFloat(contractBalance).toFixed(4)} ETH</p>
              </div>
              <div>
                <p style={{ margin: '8px 0', color: '#cbd5e1' }}><strong>Array Length:</strong></p>
                <p style={{ margin: '8px 0', color: '#60a5fa', fontSize: '1.2rem', fontWeight: 'bold' }}>{allWords.length} words</p>
              </div>
            </div>
            <div style={{ marginTop: '15px' }}>
              <p style={{ margin: '8px 0', color: '#cbd5e1' }}><strong>Full Array:</strong></p>
              <p style={{ 
                margin: '8px 0', 
                color: '#cbd5e1', 
                backgroundColor: '#0f172a',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #334155',
                fontFamily: 'monospace'
              }}>
                [{allWords.join(', ')}]
              </p>
            </div>
          </div>

          {/* Array Operations Card */}
          <div style={{ 
            backgroundColor: '#1e293b', 
            padding: '25px', 
            borderRadius: '12px', 
            marginBottom: '25px',
            border: '1px solid #334155'
          }}>
            <h2 style={{ color: '#e2e8f0', marginTop: 0, marginBottom: '20px' }}>🔪 Array Operations</h2>
            <p style={{ color: '#94a3b8', marginBottom: '25px', fontSize: '1.1rem' }}>
              Payable functions to slice the array. Enter a number to specify the slice range.
            </p>
            
            {/* First Num Elements */}
            <div style={{ 
              marginBottom: '25px', 
              padding: '20px', 
              backgroundColor: '#172554', 
              borderRadius: '8px',
              border: '1px solid #1e40af'
            }}>
              <h3 style={{ color: '#60a5fa', marginTop: 0, marginBottom: '10px' }}>🔸 First N Elements</h3>
              <p style={{ margin: '5px 0', color: '#bfdbfe', fontSize: '0.95rem' }}>
                Returns elements from index 0 to your specified number
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                <input 
                  type="number" 
                  placeholder={`Enter number (0-${allWords.length})`}
                  value={firstNumInput}
                  onChange={(e) => setFirstNumInput(e.target.value)}
                  min="0"
                  max={allWords.length}
                  style={{ 
                    padding: '12px', 
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    width: '220px',
                    backgroundColor: '#0f172a',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
                <button 
                  onClick={callFirstNumElements}
                  disabled={transactionLoading === 'firstNumElements' || !firstNumInput}
                  style={{ 
                    padding: '12px 24px',
                    backgroundColor: transactionLoading === 'firstNumElements' ? '#475569' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: transactionLoading === 'firstNumElements' ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    if (!transactionLoading && firstNumInput) e.currentTarget.style.backgroundColor = '#2563eb';
                  }}
                  onMouseOut={(e) => {
                    if (!transactionLoading && firstNumInput) e.currentTarget.style.backgroundColor = '#3b82f6';
                  }}
                >
                  {transactionLoading === 'firstNumElements' ? '🔄 Processing...' : '🚀 Call (0.001 ETH)'}
                </button>
              </div>
            </div>

            {/* Last Num Elements */}
            <div style={{ 
              marginBottom: '15px', 
              padding: '20px', 
              backgroundColor: '#172554', 
              borderRadius: '8px',
              border: '1px solid #1e40af'
            }}>
              <h3 style={{ color: '#60a5fa', marginTop: 0, marginBottom: '10px' }}>🔹 Last N Elements</h3>
              <p style={{ margin: '5px 0', color: '#bfdbfe', fontSize: '0.95rem' }}>
                Returns elements starting from your specified number to end of array
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                <input 
                  type="number" 
                  placeholder={`Enter number (0-${allWords.length})`}
                  value={lastNumInput}
                  onChange={(e) => setLastNumInput(e.target.value)}
                  min="0"
                  max={allWords.length}
                  style={{ 
                    padding: '12px', 
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    width: '220px',
                    backgroundColor: '#0f172a',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
                <button 
                  onClick={callLastNumElements}
                  disabled={transactionLoading === 'lastNumElements' || !lastNumInput}
                  style={{ 
                    padding: '12px 24px',
                    backgroundColor: transactionLoading === 'lastNumElements' ? '#475569' : '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: transactionLoading === 'lastNumElements' ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    if (!transactionLoading && lastNumInput) e.currentTarget.style.backgroundColor = '#7c3aed';
                  }}
                  onMouseOut={(e) => {
                    if (!transactionLoading && lastNumInput) e.currentTarget.style.backgroundColor = '#8b5cf6';
                  }}
                >
                  {transactionLoading === 'lastNumElements' ? '🔄 Processing...' : '🚀 Call (0.002 ETH)'}
                </button>
              </div>
            </div>

            {/* Array Slice Results */}
            {sliceResult.length > 0 && (
              <div style={{ 
                backgroundColor: '#065f46', 
                padding: '20px', 
                borderRadius: '8px',
                marginTop: '20px',
                border: '1px solid #047857'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#34d399' }}>📋 Array Slice Result:</h3>
                <p style={{ 
                  margin: '0 0 10px 0', 
                  fontWeight: 'bold', 
                  color: '#d1fae5',
                  fontSize: '1.1rem',
                  fontFamily: 'monospace'
                }}>
                  [{sliceResult.join(', ')}]
                </p>
                <p style={{ margin: '5px 0 0 0', color: '#6ee7b7', fontSize: '0.95rem' }}>
                  📏 Result length: <strong>{sliceResult.length}</strong> words
                </p>
              </div>
            )}
          </div>

          {/* Owner Functions - Only show if user is owner */}
          {isOwner && (
            <div style={{ 
              backgroundColor: '#1e293b', 
              padding: '25px', 
              borderRadius: '12px', 
              marginBottom: '25px',
              border: '1px solid #334155'
            }}>
              <h2 style={{ color: '#e2e8f0', marginTop: 0, marginBottom: '20px' }}>👑 Owner Functions</h2>
              
              {/* Update Number */}
              <div style={{ marginBottom: '25px', padding: '20px', backgroundColor: '#431407', borderRadius: '8px', border: '1px solid #7f1d1d' }}>
                <h3 style={{ color: '#f97316', marginTop: 0, marginBottom: '15px' }}>🔄 Update Default Number</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                  <input 
                    type="number" 
                    placeholder={`Enter new number (0-${allWords.length})`}
                    value={newNum}
                    onChange={(e) => setNewNum(e.target.value)}
                    min="0"
                    max={allWords.length}
                    style={{ 
                      padding: '12px', 
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      width: '220px',
                      backgroundColor: '#0f172a',
                      color: 'white',
                      fontSize: '1rem'
                    }}
                  />
                  <button 
                    onClick={updateNum}
                    disabled={transactionLoading === 'updateNumber' || !newNum}
                    style={{ 
                      padding: '12px 24px',
                      backgroundColor: transactionLoading === 'updateNumber' ? '#475569' : '#ea580c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: transactionLoading === 'updateNumber' ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      if (!transactionLoading && newNum) e.currentTarget.style.backgroundColor = '#c2410c';
                    }}
                    onMouseOut={(e) => {
                      if (!transactionLoading && newNum) e.currentTarget.style.backgroundColor = '#ea580c';
                    }}
                  >
                    {transactionLoading === 'updateNumber' ? '🔄 Updating...' : '⚡ Update Num'}
                  </button>
                </div>
                <p style={{ fontSize: '0.95rem', color: '#fdba74', margin: '10px 0 0 0' }}>
                  Current default num value: <strong style={{color: '#f59e0b'}}>{num}</strong>
                </p>
              </div>

              {/* Withdraw Funds */}
              <div style={{ padding: '20px', backgroundColor: '#431407', borderRadius: '8px', border: '1px solid #7f1d1d' }}>
                <h3 style={{ color: '#f97316', marginTop: 0, marginBottom: '15px' }}>💰 Withdraw Contract Funds</h3>
                <button 
                  onClick={withdrawFunds}
                  disabled={transactionLoading === 'withdraw' || parseFloat(contractBalance) === 0}
                  style={{ 
                    padding: '12px 24px',
                    backgroundColor: transactionLoading === 'withdraw' ? '#475569' : '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: transactionLoading === 'withdraw' || parseFloat(contractBalance) === 0 ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    if (!transactionLoading && parseFloat(contractBalance) > 0) e.currentTarget.style.backgroundColor = '#b91c1c';
                  }}
                  onMouseOut={(e) => {
                    if (!transactionLoading && parseFloat(contractBalance) > 0) e.currentTarget.style.backgroundColor = '#dc2626';
                  }}
                >
                  {transactionLoading === 'withdraw' ? '🔄 Withdrawing...' : '💸 Withdraw All Funds'}
                </button>
                <p style={{ fontSize: '0.95rem', color: '#fdba74', margin: '10px 0 0 0' }}>
                  Current contract balance: <strong style={{color: '#10b981'}}>{parseFloat(contractBalance).toFixed(4)} ETH</strong>
                </p>
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button 
              onClick={loadContractData}
              style={{ 
                padding: '12px 24px',
                backgroundColor: '#475569',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#475569'}
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
