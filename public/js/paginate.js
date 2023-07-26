nextPage = nextPage;

function fetchMoreCampgrounds() {
	fetch(`campgrounds?page=${nextPage}`)
		.then((response) => response.json())
		.then((data) => {
			nextPage = data.nextPage;
			const campgroundsContainer = document.querySelector(
				'.campgrounds-container'
			);
			data.campgrounds.forEach((campground) => {
				const card = document.createElement('div');
				card.className = 'card mb-3';

				const row = document.createElement('div');
				row.className = 'row';

				const imageContainer = document.createElement('div');
				imageContainer.className = 'col-md-4';

				const campgroundImg = document.createElement('img');
				campgroundImg.className = 'img-fluid';
				campgroundImg.src =
					campground.images[0]?.url ||
					'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80';
				campgroundImg.alt = 'campground-photo';

				imageContainer.append(campgroundImg);

				const cardBodyContainer = document.createElement('div');
				cardBodyContainer.className = 'col-md-8';

				const cardBody = document.createElement('div');
				cardBody.className = 'card-body';

				const campgroundTitle = document.createElement('h5');
				campgroundTitle.className = 'card-title';
				campgroundTitle.textContent = campground.title || '--';

				const campgroundDescription = document.createElement('p');
				campgroundDescription.className = 'card-text';
				campgroundDescription.textContent = campground.description || '--';

				const campgroundLocationContainer = document.createElement('p');
				campgroundLocationContainer.className = 'card-text';

				const campgroundLocation = document.createElement('small');
				campgroundLocation.className = 'text-muted';
				campgroundLocation.textContent = campground.location || '--';

				campgroundLocationContainer.append(campgroundLocation);

				const campgroundViewBtn = document.createElement('a');
				campgroundViewBtn.className = 'btn btn-primary';
				campgroundViewBtn.href = `/campgrounds/${campground.id || ''}`;
				campgroundViewBtn.textContent = 'View ' + campground.titl || '';

				cardBody.append(
					campgroundTitle,
					campgroundDescription,
					campgroundLocationContainer,
					campgroundViewBtn
				);

				cardBodyContainer.append(cardBody);

				row.append(imageContainer, cardBodyContainer);

				card.append(row);

				campgroundsContainer.append(card);
			});

			// hide more-btn
			if (!nextPage) {
				moreBtn.style.display = 'none';
			}
		})
		.catch((error) => console.error(error));
}

const moreBtn = document.getElementById('more-btn');
moreBtn.addEventListener('click', fetchMoreCampgrounds);
