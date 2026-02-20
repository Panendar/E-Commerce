import React, { useEffect, useState } from 'react';

function Products({onSelectProduct}) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_BASE_URL}/products`)
            .then((response) => response.json())
            .then((data) => {
            console.log('Products API response:', data);
            setProducts(Array.isArray(data) ? data : []);
            setLoading(false);
            })
            .catch(() => {
            alert('Failed to load products');
            setLoading(false);
            });
    }, []);


    if (loading) {
    return <p>Loading products...</p>;
    }

    if (!Array.isArray(products)) {
    return <p>Invalid product data</p>;
    }


    return (
        <div>
            <h2>Products</h2>

            {products.map(product => (
                <div key={product.id} style={{border: '1px solid #ccc', marginBottom: '10px', padding: '10px'}}>
                    <h3>{product.name}</h3>
                    <img src={product.image_url} alt={product.name} />
                    <p>{product.description}</p>
                    <p>Price: ₹{product.price}</p>
                    <p>Stock: {product.stock}</p>
                    <button onClick={() => onSelectProduct(product.id)}>
                      View Details
                    </button>
                </div>
            ))}
        </div>
    );
}

export default Products;