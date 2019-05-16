# :) Hello!

## Notes for myself

*A Trello board would probably be a better place for this, I know... Working on a solution*

### Design Ideas
* Use photo of Bean as the cover image for the site
* Black-brown(#2b2521)/gray-brown(#594f49)/sage(#85aa8c) color scheme - Inspired by Bean's fur and eyes!
* Bean cursive logo made of yarn with the B being the shape of a bean and also the pad of a paw-print

### Feature Ideas
* Users sare able to share pets. More than one person may care for a pet.
	* "Please enter the email of other caregivers" (find the ID and add to pets owners array)
* If you remove a pet from your ownership, and you were the only owner the pet will be deleted, needs confirmation alert
* All fields are editable on checkup edit - even if you initially didn't assign any value to them.
* Users can highlight fields on the checkup entry form to masrk them so they are either positive, negative, or neutral.
	* Pos/neg highlights will be displayed on checkups list. This way, it will stand out on the checkup summary and the user can give details to their vet quickly at an appointment.
* After a user edits a checkup, delete fields they deleted and add (assign) fields they added information to.
* Checkup entry form has checkboxes with dropdowns to display fields the user wants to enter data for.


### Code Notes
* Object.assign to assign reported fields to checkup details - only render reported fields on checkup details page
* Verify the user has at least entered one piece of data in the checkup entry form
* Do not fetch all checkups on the requests, only get the ones pertinent to the ID you're looking for.

### Data Structure Ideas

**Users**
```js
{users: [
	{
		id: "id123",
		firstName: "Alyse",
		email: "alyse.bos@gmail.com",
		password: "someHashedPassword",
		profilePhoto: "id345", // USE ONE OF THE OWNER'S PETS TO BE THEIR PROFILE PHOTO
		preferences: {
			notifications: true,
			language: "us-en",
			timeZone: "pacific"
		},
		pets: ["id234", "id345"]
	},
	{
		id: "id456",
		firstName: "Alex",
		email: "eqaddictedfool@gmail.com",
		password: "someOtherHashedPassword",
		preferences: {
			notifications: false,
			language: "us-en",
			timeZone: "pacific"
		},
		pets: ["id234"]
	}
]}
```

**Pets**
```js
{pets: [
	{
		id: "id234",
		name: "Bean",
		species: "Cat",
		breed: "American Shorthair",
		weightUnits: "pounds",
		birthDate: "August 1, 2001",
		photoUrl: "http://www.imgur.com/urlofthepetphoto.png",
		owners: ["id123", "id456"],
		checkups: ["id567", "id678"]
	},
	{
		id: "id345",
		name: "Turd",
		species: "Cat",
		breed: "American Longhair",
		weightUnits: "pounds",
		birthDate: "April 1, 2009",
		photoUrl: "http://www.imgur.com/urlofthepetphoto.png",
		owners: ["id123"],
		checkups: ["id890"]
	}
]}
```

**Checkups**
```js
{checkups: [
	{
		id: "id567",
		pet: "id234",
		date: "March 30, 2019",
		vet: true,
		physical: [{
			weight: {
				highlight: "positive",
				value: 9.1,
				remarks: "Gained .2 pounds"
			},
			temperature: {
				highlight: false,
				value: 100,
				remarks: false
			}
			// LOOK UP THINGS VETS CHECK DURING NORMAL EXAM.
		}],
		nonPhysical: [{
			temperament: {
				highlight: false,
				value: false,
				remarks: false
				// IF A USER DOESN'T FILL IN A FIELD, ALL WILL BE FALSE AND DATA SHOULD NOT BE DISPLAYED ON GET
			}
		}]
		vetActions: {
			// USER CAN ONLY ADD TO THIS SECTION IF VET IS TRUE ABOVE
			prescriptions: [{
				name: "flea medicine",
				frequency: "monthly",
				duration: "12 months",
				dose: "one squirt bottle",
				application: "squeeze between shoulder blades"
			}],
			vaccines: ["rabies", "feline leukemia"],
			treatments: ["dental cleaning"]
		},
		miscNotes: "Any miscellaneous notes about the checkup in a text box.
					Try to let the user use some formatting, like new lines.
					Use regex to disallow any HTML or special characters which
					would need to be escaped. Look up help!"
	}
]}
```

### Stretch Goals
* Notify users monthly to record checkups of their pets