import classes from '.AddBtn.module.css'
import { useState } from 'react'


const Modal = ({onClose, onAddAddTask }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
        onAddAddTask({id: Date.now(), title, description, done: false});
        onClose();
    };

    return (
        <>
            <div className={classes.modal}>
                <div className={classes.mkodelContent}>
                    <h2>Добавить задачу</h2>
                    <input 
                        type="text"
                        placeholder='Заголовок'
                        value={title}
                        onChange={ (e) => setDescription(e.target.value)}
                    />
                    <button onClick={handleSubmit}>Сохранить</button>
                    
                    <button onClick={onClose}>Закрыть</button>
                </div>
            </div>
        </>
    );
};



export default function AddBtn(onAddAddTask) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    return (
        <>
            <div 
                className={classes['add-task-btn']}
                onClick={ () => setIsModalOpen(true)}
                style={{cursor: 'pointer'}}
            >
                <h3>Добавить задачу</h3>
            </div>
        </>
    )
};