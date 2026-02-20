import React, { useEffect, useState } from 'react';

function ProductDetail({ productId, onBack, currentUser}) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_BASE_URL}/products/${productId}`)
            .then((res) => res.json())
            .then((data) => {
            console.log('Product detail API response:', data);
            setProduct(data);
            setLoading(false);
        })
        .catch(() => {
        alert('Failed to load product');
        setLoading(false);
        });
    }, [productId]);


    if (loading) return <p>Loading Product....</p>;
    if (!product) return <p>Product not found</p>;

    return(
        <div>
            <button onClick={onBack}>Back to Products</button>
            <h2>{product.name}</h2>
            <img src={product.image_url || product.image} alt={product.name} />
            <p>{product.description}</p>
            <p>Price: ₹{product.price}</p>
            <p>Stock: {product.stock}</p>
        </div>
    );
}

export default ProductDetail;