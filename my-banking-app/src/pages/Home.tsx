import React from 'react';
import BottomNav from './buttomnav'; // ใช้ไฟล์เดิมได้ แต่คอมโพเนนต์ต้องชื่อ BottomNav
import './buttomnav.css';
import './Home.css';

function Home() {
  const username = 'Amanda';

  return (
    <div className="App">
      {/* Header */}
      <div className="header">
        <div
          className="profile-avatar"
          data-initial={username.trim().charAt(0).toUpperCase()}
        />
        <h2 className="username">{username}</h2>
      </div>

      <div className="main-content">
        {/* Balance Card */}
        <div className="balance-card">
          <div className="balance-display">
            <p className="balance-label">เงินรวม</p>
            <p className="balance-label">8/2025</p>
            <p className="balance-amount">40,000 บาท</p>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="action-button">
              <div className="action-icon">
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#374151' }}>1000</span>
              </div>
              <span className="action-label">กึ่งหมด</span>
            </button>

            <button className="action-button">
              <div className="action-icon">
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#374151' }}>1200</span>
              </div>
              <span className="action-label">รายได้</span>
            </button>

            <button className="action-button">
              <div className="action-icon">
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>-200</span>
              </div>
              <span className="action-label">ค่าใช้จ่าย</span>
            </button>
          </div>
        </div>

        {/* Recent Transactions Header */}
        <div className="transaction-header">
          <span className="transaction-title active">ล่าสุด</span>
          <span className="transaction-link">ดูทั้งหมด</span>
        </div>

        {/* Recent Transaction */}
        <div className="transaction-item">
          <div className="transaction-info">
            <div className="transaction-avatar"></div>
            <span className="transaction-description">ซื้อหมูกรอบ</span>
          </div>
          <span className="transaction-amount">-200</span>
        </div>

        {/* Monthly Categories */}
        <div className="category-grid">
          <div className="category-card">
            <div className="category-icon"></div>
            <p className="category-name">ไทยพาณิชย์</p>
            <p className="category-amount">20,000 บาท</p>
          </div>

          <div className="category-card">
            <div className="category-icon"></div>
            <p className="category-name">กสิกรไทย</p>
            <p className="category-amount">20,000 บาท</p>
          </div>

          <div className="category-card">
            <div className="category-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2rem', color: '#374151' }}>+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

export default Home;
