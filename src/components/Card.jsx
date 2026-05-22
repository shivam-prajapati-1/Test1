import React from 'react';

const Card = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`card shadow-sm ${className}`} 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.2s' }}
      onMouseEnter={(e) => onClick && (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={(e) => onClick && (e.currentTarget.style.transform = 'none')}
    >
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;
