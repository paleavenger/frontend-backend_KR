export default function ProductCard({ product, onEdit, onDelete }) {
    return (
        <div className="card">
            <div className="card-img-container">
                {product.category && (
                    <div className="card-category">
                        {product.category}
                    </div>
                )}
                <img
                    src={product.image}
                    alt={product.title}
                    className="card-img"
                />
            </div>

            <div className="card-body">
                <h2 className="card-title">{product.title}</h2>

                <p className="card-text">{product.description}</p>

                <p className="card-price">
                    <strong>{product.price} $</strong>
                </p>

                {product.stock !== undefined && (
                    <p className="card-quantity">
                        В наличии: {product.stock}
                    </p>
                )}

                <button className="card-button">
                    Купить
                </button>

                <div className="admin-buttons">
                    <button onClick={() => onEdit(product)}>
                        Изменить
                    </button>

                    <button onClick={() => onDelete(product.id)}>
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    );
}
