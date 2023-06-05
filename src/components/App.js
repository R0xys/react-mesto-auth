import Header from "./Header";
import Main from "./Main";
import Footer from "./Footer";
import ImagePopup from "./ImagePopup";
import React from 'react';
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import {api} from "../utils/api.js";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup  from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import ConfirmDeletePopup from "./ConfirmDeletePopup";

function App() {
  function handleEditAvatarClick() {
    setEditAvatarPopupOpen(true);
  }

  function handleEditProfileClick() {
    setEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setAddPlacePopupOpen(true);
  }

  function closeAllPopups() {
    setEditProfilePopupOpen(false);
    setAddPlacePopupOpen(false);
    setEditAvatarPopupOpen(false);
    setSelectedCard({name: '', link: ''});
    setConfirmDeletePopupOpen(false);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i._id === currentUser._id);
    if (!isLiked) {
      api.putLike(card._id)
        .then((newCard) => {
          setCardsList((cardsList) => cardsList.map((c) => c._id === card._id ? newCard : c));
        })
        .catch((err) => console.log(err))
    }
    else if (isLiked) {
      api.deleteLike(card._id)
      .then((newCard) => {
        setCardsList((cardsList) => cardsList.map((c) => c._id === card._id ? newCard : c));
      })
      .catch((err) => console.log(err))
    }
  }

  function handleCardDelete(card) {
    api.deleteCard(card._id)
      .then(() => {
        setCardsList((cardsList) => cardsList.filter(c => card !== c));
        closeAllPopups();
      })
      .catch((err) => console.log(err))
  }

  function handleUpdateUser(newData) {
    api.updateUserApi(newData)
      .then(res=> {
        setCurrentUser({
          ...currentUser,
           name: res.name,
          about: res.about});
        closeAllPopups();
      })
      .catch((err) => console.log(err))
  }

  function handleUpdateAvatar(link) {
    api.updateAvatar(link)
      .then(res => {
        setCurrentUser({
          ...currentUser,
          avatar: res.avatar,
        });
        closeAllPopups();
      })
      .catch((err) => console.log(err))
  }

  function handleAddPlaceSubmit(card) {
    api.addNewCard(card)
      .then(res => {
        setCardsList([res, ...cardsList]);
        closeAllPopups();
      })
      .catch((err) => console.log(err))
  }

  function handleOpenConfirmDeletePopup(c) {
    setConfirmDeletePopupOpen(true);
    setDataConfirmDeletePopup(c);
  }

  const [isEditProfilePopupOpen, setEditProfilePopupOpen] = React.useState(false);
  const [isAddPlacePopupOpen, setAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setEditAvatarPopupOpen] = React.useState(false);
  const [isConfirmDeletePopupOpen, setConfirmDeletePopupOpen] = React.useState(false);
  const [dataConfirmDeletePopup, setDataConfirmDeletePopup] = React.useState({});
  const [selectedCard, setSelectedCard] = React.useState({name: '', link: ''});
  const [currentUser, setCurrentUser] = React.useState({});
  const [cardsList, setCardsList] = React.useState([]);

  React.useEffect(() => {
    Promise.all([api.getApiData("users/me"), api.getApiData("cards")])
    .then(([userData, cardsData]) => {
      setCurrentUser(userData);
      setCardsList(cardsData);
    })
    .catch((err) => console.log(err))
  }, [])

  return (
    <CurrentUserContext.Provider value={{currentUser, cardsList}}>
      <div className="page__content">
        <Header />
        <Main onCardDelete={handleOpenConfirmDeletePopup} onEditProfile={handleEditProfileClick} onAddPlace={handleAddPlaceClick} onEditAvatar={handleEditAvatarClick} onCardClick={handleCardClick} onCardLike={handleCardLike} />
        <Footer />
        <AddPlacePopup onAddPlace={handleAddPlaceSubmit} isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} />
        <EditProfilePopup onUpdateUser={handleUpdateUser} isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} />
        <EditAvatarPopup onUpdateAvatar={handleUpdateAvatar} isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} />
        <ConfirmDeletePopup onConfirm={handleCardDelete} onClose={closeAllPopups} isOpen={isConfirmDeletePopupOpen} card={dataConfirmDeletePopup} />
        <ImagePopup card={selectedCard} onClose={closeAllPopups} />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
