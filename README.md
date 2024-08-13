# NAME

ldla-react-uploader-cloudinary

![Description de l'image](/src/images/Uploadcover.png)
![Description de l'image](/src/images/Upload4desktop.png)

## DESCRIPTION

Simple composant Uploader multiple to Cloudinary. Avec affichage résultats, liste complete des images sur le cloud et une suppression individuelle possible pour chaque image. le vertical navbar permet de naviguer sur la page par point d'ancrage.


## INSTALLATION

Pour installer ldla-react-uploader-cloudinary dans votre projet, utilisez npm :

npm install ldla-react-uploader-cloudinary

ou avec yarn :

yarn add ldla-react-uploader-cloudinary


## UTILISATION

```jsx

DANS VOTRE APPLICATION:

import React from 'react';
import ImageUploader from 'ldla-react-uploader-cloudinary';
import './App.css';

function App() {
  return (
    <div className="App">
      <ImageUploader />
    </div>
  );
}

export default App;

CSS APPLICATION:

@import url('https://fonts.googleapis.com/css2?family=Ysabeau+SC:wght@300&display=swap');

.App {
    width:100%;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    margin:0 auto;
    padding:0;
    box-sizing:border-box;
    background:black;
}

LE COMPOSANT UPLOADER:

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Upload.css';

function Upload() {

    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("upload");

    const handleMouseEnter = () => {
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        setIsOpen(false);
    };

    const handleNavigation = (sectionId, tabName) => {
        setActiveTab(tabName);
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };


    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadResult, setUploadResult] = useState(null);
    const [images, setImages] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const fileInputRef = React.createRef();

    // Fonction pour récupérer les images depuis Cloudinary //
    const fetchImages = async () => {
        try {
            const response = await axios.get('http://localhost:3001/images');
            setImages(response.data);
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    // Fonction pour uploader les images vers Cloudinary //
    const handleFileChange = (event) => {
        setSelectedFiles(event.target.files);
    };

    const handleUpload = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('images', selectedFiles[i]);
        }

        try {
            const response = await axios.post('http://localhost:3001/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setUploadResult(response.data);
            setSelectedFiles([]);  // Réinitialise l'état pour vider l'input file //
            event.target.reset();  // Réinitialise le formulaire //
            fileInputRef.current.value = "";

            // Réactualise la liste des images après l'upload //
            fetchImages();
        } catch (error) {
            console.error('Error uploading images:', error);
        }
    };

    // Fonction pour ouvrir la modale //
    const showModal = (message) => {
        setModalMessage(message);
        setIsModalVisible(true);
    };

    // Fonction pour fermer la modale //
    const closeModal = () => {
        setIsModalVisible(false);
    };

    // Fonction pour supprimer une image //
    const handleDelete = async (publicId) => {
        try {
            // Envoi une requête DELETE au serveur local qui gère la suppression de l'image sur Cloudinary //
            const response = await axios.delete(`http://localhost:3001/images/${publicId}`);
            // Vérifie si la suppression a réussi //
            if (response.status === 200) {
                fetchImages(); // Réactualise la liste des images après la suppression //
                showModal('Image deleted successfully.')
            } else {
                console.error('Failed to delete image:', response.data.message);
            }
        } catch (error) {
            console.error('Error deleting image:', error.response ? error.response.data : error.message)
        }
    };
    

    return (
        <div className= "container-component">
            <div className="container-nav">
                <div 
                    className={`vertical-navbar ${isOpen ? 'open' : 'closed'}`} 
                    onMouseEnter={handleMouseEnter} 
                    onMouseLeave={handleMouseLeave}
                >
                    <button 
                        className={`navbar-btn ${activeTab === "upload" ? "active" : ""}`} 
                        onClick={() => handleNavigation("upload-section", "upload")}
                    >
                        Upload
                    </button>
                    <button 
                        className={`navbar-btn ${activeTab === "result" ? "active" : ""}`} 
                        onClick={() => handleNavigation("result-section", "delete")}
                    >
                        Result
                    </button>
                    <button 
                        className={`navbar-btn ${activeTab === "getAll" ? "active" : ""}`} 
                        onClick={() => handleNavigation("getall-section", "getAll")}
                    >
                        Get All
                    </button>
                    <button 
                        className={`navbar-btn ${activeTab === "delete" ? "active" : ""}`} 
                        onClick={() => handleNavigation("getall-section", "delete")}
                    >
                        Delete
                    </button>
                </div>

                <div 
                    className="menu-icon" 
                    onMouseEnter={handleMouseEnter} 
                    onMouseLeave={handleMouseLeave}
                >
                    <FontAwesomeIcon icon={faBars} />
                </div>

                {/* Contenu principal en fonction du bouton actif */}
                <div className="content">
                    {activeTab === "upload"}
                    {activeTab === "getAll"}
                    {activeTab === "delete"}
                </div>
            </div>

            <div className="container-form">
                <h1 id="upload-section" className="title-form">Upload Images to Cloudinary</h1>
                <form onSubmit={handleUpload}>
                    <input type="file" multiple onChange={handleFileChange} ref={fileInputRef} />
                    <button type="submit">Upload</button>
                </form>
                {uploadResult && (
                <div className="container-result">
                    <h2 id="result-section" className="result">Last Upload Result</h2>
                    <ul className="list">
                        {uploadResult.results.map((result, index) => (
                            <li className="element-list" key={index}>
                                <img src={result.secure_url} alt={result.public_id} width="30" />
                                <p className="name">Name: {result.original_filename}</p>
                                <p className="url">Cloudinary URL: <a className="link" href={result.secure_url} target="_blank" rel="noopener noreferrer">{result.secure_url}</a></p>
                            </li>
                        ))}
                    </ul>
                </div>
                )}
                <div className="container-images">
                    <h2 id="getall-section">Uploaded Images List</h2>
                    <ul className="images-list">
                        {images.map((image, index) => (
                            <li className="image-item" key={index}>
                                <img src={image.secure_url} alt={image.public_id} width="30" />
                                <p className="name">Name: {image.public_id}</p>
                                <p className="url">Url: {image.url}</p>
                                <button onClick={() => handleDelete(image.public_id)}>Delete</button> 
                            </li>
                        ))}
                    </ul>
                </div>
                <Navbar />
                {/* Modale pour afficher le message de succès */}
                {isModalVisible && (
                    <div className="modal">
                        <div className="modal-content">
                            <span className="close-button" onClick={closeModal}>&times;</span>
                            <p>{modalMessage}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Upload;

CSS COMPOSANT UPLOADER: 

.container-component {
    width:100%;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    margin:0 auto;
    padding:0;
    box-sizing:border-box;
}

/* vertical navbar */
.vertical-navbar {
  height: 100vh;
  width: 0px; /* Largeur initiale (rétractée) */
  position: fixed;
  top: 60px;
  left: 0;
  background-color: black;
  transition: width 0.3s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1000;
}

.vertical-navbar.open {
  width: 200px; /* Largeur lors de l'expansion */
}

.navbar-btn {
  width: 100%;
  padding: 15px 10px;
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.3s, color 0.3s;
}

.navbar-btn:hover {
  background-color: #1e1e1e;
}

.navbar-btn.active {
  background-color:aqua; /* Couleur active */
  color:black;
}

.menu-icon {
  position: fixed;
  top: 15px;
  left: 15px;
  font-size: 24px;
  cursor: pointer;
  color: white;
  font-family: 'Ysabeau SC', sans-serif;
}

.content {
  margin-left: 60px;
  padding: 20px;
  color: white;
}

.vertical-navbar.open + .content {
  margin-left: 200px;
}

@media (max-width: 1312px) {
  .vertical-navbar.open {
      width:100px;
  }
}

@media (max-width: 768px) {
  .vertical-navbar.open {
      width:100px;
  }
  .container-form,
  .container-result,
  .container-images {
      width: 90%; /* Réduit la largeur sur les écrans plus petits */
      padding: 5%;
  }

  .form,
  .images-list {
      width: 100%; /* Ajuste la largeur pour les petits écrans */
  }

  .image-item {
      padding: 5px;
  }

  input[type="file"] {
      width: 100%; /* Remplit la largeur du parent sur les petits écrans */
  }

  button {
      width: 100%; /* Boutons plus larges sur les petits écrans */
  }

  .menu-icon {
      width: auto; /* Ajuste automatiquement la largeur du menu icône */
  }

  .modal-content {
      width: 90%; /* Modale plus adaptée sur petits écrans */
      padding: 10px;
  }

  .title-form, 
  .result, 
  #getall-section {
      font-size: 24px; /* Réduit la taille des titres */
  }
}

@media (max-width: 480px) {
  .title-form, 
  .result, 
  #getall-section {
      font-size: 20px; /* Réduit encore plus la taille des titres */
  }

  .image-item {
      font-size: 16px; /* Texte plus petit sur les très petits écrans */
  }

  .close-button {
      font-size: 20px; /* Taille du bouton de fermeture adaptée */
  }
}

/*************************Uploader********************************/


.container-form {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  width:90%;
  padding:5%;
  min-height:100vh;
  background-color: black;
}

.title-form {
  color:white;
  text-transform: uppercase;
  margin-bottom: 15px;
  font-family: 'Ysabeau SC', sans-serif;
}

form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #1e1e1e;
  width:60%;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  text-align: center;
}

input[type="file"] {
  margin-bottom: 20px;
  padding: 10px;
  color: #ffffff;
  background-color: #333;
  border: 2px solid #555;
  border-radius: 5px;
  cursor: pointer;
  font-family: 'Ysabeau SC', sans-serif;
  width:90%;
  text-align: center;
}

input[type="file"]::-webkit-file-upload-button {
  background-color: #444;
  border: 2px solid #555;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  color: #fff;
  font-family: 'Ysabeau SC', sans-serif;
  margin-right: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin:0 auto;
  text-align: center;
}

button {
  padding: 10px 20px;
  background-color: aqua;
  border: none;
  border-radius: 5px;
  color: black;
  font-family: 'Ysabeau SC', sans-serif;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: white;
}

pre {
  background-color: #1e1e1e;
  padding: 10px;
  border-radius: 5px;
  /*overflow-x: auto;*/
  color: #cccccc;
}

/*Section resul*/

.container-result {
  width:75%;
  padding: 5%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 120px;
  margin-bottom: 0px;
  border-radius:10px;
  background-color: #1e1e1e;
}

.result {
  text-transform: capitalize;
  color:white;
  font-size: 22px;
  font-family: 'Ysabeau SC', sans-serif;
  text-decoration: underline;
}

.list {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: left;
  width:100%;
  color:white;
  list-style:decimal;
}

.element-list {
  text-align: left;
  position: relative;
  margin:0 auto;
  font-family: 'Ysabeau SC', sans-serif;
  width:96%;
  padding:2%;
  margin-left: -30px;
}
.element-list img {
  object-fit: cover;
}

.name, .url, .optimized-url, .auto-crop-url {
  color:white;
  font-size:20px;
  text-decoration: none;
  text-align: left;
}


.link{
  width:100%;
  overflow-wrap: break-word;
  color:aqua;
}

/*List Uploaded*/

.container-images {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  padding: 5%;
  background-color: black;
  width:78%;
}

.images-list {
  width:100%;
  background-color: #1e1e1e;
  padding:40px;
  border-radius:10px;
  object-fit: cover;
}

#getall-section {
  color:white;
  text-transform: uppercase;
  margin-bottom: 15px;
  font-family: 'Ysabeau SC', sans-serif;
  font-size: 30px;
}


.image-item {
  padding: 10px;
  border-radius: 0px;
  text-align: left;
  color:aqua;
  font-family: 'Ysabeau SC', sans-serif;
  list-style:decimal;
  border:1px solid aqua;

}
.image-item .url{
  color:aqua;
  overflow-wrap: break-word;
}

.image {
  max-width: 100%;
  border-radius: 4px;
}

/*Modale*/

.modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width:100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: #1e1e1e;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  color: aqua;
  border:1px solid aqua;
}

.close-button {
  color: aqua;
  float: right;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
}

.close-button:hover,
.close-button:focus {
  color: white;
}


Pour personnaliser l apparence de l uploader, vous pouvez ajouter vos propres styles CSS ou modifier les styles par défaut dans votre fichier de feuille de style.