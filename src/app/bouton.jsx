import React, { useState } from 'react';
import { addEvent } from './pathToYourFunctions'; // Assurez-vous que le chemin est correct

const EventForm = () => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    addEvent(); // Ajoute l'événement après la validation du formulaire
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom de l'événement"
      />
      <button type="submit">Ajouter Événement</button>
    </form>
  );
};

export default EventForm;
