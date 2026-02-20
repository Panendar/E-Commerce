import React, { useEffect, useState } from 'react';

function Orders({ currentUser }) {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_BASE_URL}/orders/${currentUser}`)
            .then((res) => res.json())
            .then((data) => setOrders(data))
            .catch(() => alert('Failed to load orders'));
    }, [currentUser]);
    return (
        <div>
            <h2>My Orders</h2>

            {orders.length === 0 && <p>No orders yet</p>}

            {orders.map((order) => (
                <div key={order.id} style={{ border: '1px solid #ccc', marginBottom: '10px', padding: '10px' }}>
                <p>Status: {order.status}</p>
                <p>Total: ₹{order.total_amount}</p>

                {order.items.map((item, index) => (
                    <div key={index}>
                    <p>{item.name} × {item.quantity}</p>
                    </div>
                ))}
                </div>
            ))}
        </div>
    );
}

export default Orders;