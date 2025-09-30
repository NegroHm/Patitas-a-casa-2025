// Components import
import {TarjetaDestacada} from '../TarjetaDestacada'

// hook import
import { useEffect, useState } from 'react';
import useGet from '../../../../../hooks/services/useGet';
import useDataHoPet from '../../../../../hooks/useDataHoPet'

// Google Drive service
import { fetchImagesFromFolder } from '../../../../../services/googleDrive';

// style import
import styles from './styles.module.css';

const TarjetaDestacadaContainer = () => {
	const { data, status } = useGet("form");
	const [recentImages, setRecentImages] = useState([]);
	const [loading, setLoading] = useState(true);

	// Check if Google Drive credentials are configured
	const checkCredentials = () => {
		const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
		const perdidosFolder = import.meta.env.VITE_GOOGLE_DRIVE_PERDIDOS_FOLDER_ID;
		const encontradosFolder = import.meta.env.VITE_GOOGLE_DRIVE_ENCONTRADOS_FOLDER_ID;
		
		return apiKey && perdidosFolder && encontradosFolder;
	};

	// Fetch recent images from both folders
	useEffect(() => {
		const fetchRecentImages = async () => {
			if (!checkCredentials()) {
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				
				// Fetch images from both folders
				const [lostImages, foundImages] = await Promise.all([
					fetchImagesFromFolder('perdidos').catch(() => []),
					fetchImagesFromFolder('encontrados').catch(() => [])
				]);

				// Combine and sort by creation date (most recent first)
				const allImages = [
					...lostImages.map(img => ({ ...img, type: 'perdidos' })),
					...foundImages.map(img => ({ ...img, type: 'encontrados' }))
				];

				allImages.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));

				// Take only the latest 5 images
				setRecentImages(allImages.slice(0, 5));
			} catch (error) {
				console.error('Error fetching recent images:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchRecentImages();
	}, []);

	// If Google Drive is not configured, fall back to form data
	if (!checkCredentials()) {
		if (!data || !data.data) {
			return <p>Cargando...</p>;
		}
		
		const TranslateSize = (size) => {
			switch (size) {
				case 'SMALL':
					return 'Pequeño';
				case 'MEDIUM':
					return 'Mediano';
				case 'LARGE':
					return 'Grande';
				default:
					return size;
			}
		};

		const lostData = data.data.filter((item) => item.type_search === "LOST");
		const foundData = data.data.filter((item) => item.type_search === "FOUND");

		lostData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
		foundData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

		// Interlevar los datos de "LOST" y "FOUND"
		const interleavedData = [];
		for (let i = 0; i < Math.max(lostData.length, foundData.length); i++) {
			if (i < lostData.length) {
				interleavedData.push(lostData[i]);
			}
			if (i < foundData.length) {
				interleavedData.push(foundData[i]);
			}
		}

		const combinedData = interleavedData.slice(0, 6);

		return (
			<section className={styles.tarjetaDestacadaContainer}>
				{combinedData?.map(({ _id, name, size, loss_date, address, contact, description, image_url }) => (
					<TarjetaDestacada
						key={_id}
						nombre={name ? name : 'Encontrado'}
						image={image_url}
						length={TranslateSize(size)}
						date={loss_date ? loss_date.split('T')[0] : ''}
						place={address}
						contact={contact}
						description={description}
					/>
				))}
			</section>
		);
	}

	// Loading state for Google Drive images
	if (loading) {
		return <p>Cargando publicaciones recientes...</p>;
	}

	// Format date for display
	const formatDate = (dateString) => {
		if (!dateString) return 'Fecha desconocida';
		const date = new Date(dateString);
		return date.toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	// No images available
	if (recentImages.length === 0) {
		return (
			<div className={styles.noImages}>
				<p>No hay imágenes recientes disponibles</p>
				<p>Las fotos subidas aparecerán aquí</p>
			</div>
		);
	}

	// Display recent images from Google Drive
	return (
		<section className={styles.recentImagesContainer}>
			{recentImages.map((image) => (
				<div key={image.id} className={styles.recentImageCard}>
					<div className={styles.imageWrapper}>
						<img
							src={image.directUrl}
							alt={image.name}
							className={styles.recentImage}
							loading="lazy"
							onError={(e) => {
								// Fallback to other URL formats if main one fails
								if (e.target.src === image.directUrl) {
									e.target.src = image.publicUrl;
								} else if (e.target.src === image.publicUrl) {
									e.target.src = image.thumbnailUrl2;
								}
							}}
						/>
						<div className={styles.imageOverlay}>
							<span className={styles.imageType}>
								{image.type === 'perdidos' ? '🔍 Perdido' : '🏠 Encontrado'}
							</span>
						</div>
					</div>
					<div className={styles.imageInfo}>
						<p className={styles.imageName} title={image.name}>
							{image.name.length > 20 ? `${image.name.substring(0, 20)}...` : image.name}
						</p>
						<p className={styles.imageDate}>
							{formatDate(image.createdTime)}
						</p>
					</div>
				</div>
			))}
		</section>
	);
}

export default TarjetaDestacadaContainer
