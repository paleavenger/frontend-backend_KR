import { useEffect, useState } from "react";

export default function ProductModal({
                                         open,
                                         mode,
                                         initialData,
                                         onClose,
                                         onSubmit,
                                     }) {
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [stock, setStock] = useState("");
    const [image, setImage] = useState("");

    useEffect(() => {
        if (!open) return;

        setTitle(initialData?.title || "");
        setPrice(initialData?.price || "");
        setCategory(initialData?.category || "");
        setDescription(initialData?.description || "");
        setStock(initialData?.stock || "");
        setImage(initialData?.image || "");
    }, [open, initialData]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };

        if (open) {
            window.addEventListener("keydown", handleEsc);
        }

        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, [open, onClose]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title.trim()) {
            alert("Название обязательно");
            return;
        }

        if (!price || isNaN(price)) {
            alert("Цена обязательна");
            return;
        }

        onSubmit({
            title,
            price: Number(price),
            category,
            description,
            stock: stock ? Number(stock) : 0,
            image: image || "/images/default.jpg",
        });
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-window"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>
                        {mode === "create"
                            ? "Добавить товар"
                            : "Редактировать товар"}
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <form className="modal-form" onSubmit={handleSubmit}>
                    <input
                        placeholder="Название *"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <input
                        placeholder="Цена *"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />

                    <input
                        placeholder="Категория"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />

                    <textarea
                        placeholder="Описание"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <input
                        placeholder="Количество"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                    />

                    <input
                        placeholder="URL картинки"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                    />

                    <div className="modal-buttons">
                        <button type="submit" className="primary-btn">
                            {mode === "create" ? "Создать" : "Сохранить"}
                        </button>

                        <button type="button" onClick={onClose}>
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
