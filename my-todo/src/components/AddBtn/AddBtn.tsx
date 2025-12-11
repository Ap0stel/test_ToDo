import classes from "./AddBtn.module.css";
import { useState } from "react";
import { Task } from "../../types";

interface ModalProps {
  onClose: () => void;
  onAddTask: (task: Task) => void;
}

const Modal = ({ onClose, onAddTask }: ModalProps) => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const handleSubmit = () => {
    if (title.trim()) {
      onAddTask({
        id: Date.now(),
        title,
        description,
        completed: false,
      });
      onClose();
    }
  };

  return (
    <div className={classes.modal}>
      <div className={classes.modalContent}>
        <h2>Добавить задачу</h2>
        <input
          type="text"
          placeholder="Заголовок"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={handleSubmit}>Сохранить</button>

        <button onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
};

interface AddBtnProps {
  onAddTask: (task: Task) => void;
}

export default function AddBtn({ onAddTask }: Readonly<AddBtnProps>) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  return (
    <>
      <button
        className={classes["add-task-btn"]}
        onClick={() => setIsModalOpen(true)}
        style={{ cursor: "pointer" }}
      >
        <h3>Добавить задачу</h3>
      </button>
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)} onAddTask={onAddTask} />
      )}
    </>
  );
}
