/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#the-app-namespace
// for information about these interfaces
declare namespace App {
	// interface Locals {}
	// interface Platform {}
	// interface Session {}
	// interface Stuff {}
}

interface ImportMetaEnv {
	VITE_URL_API: string,
	VITE_API_KEY: string
}

type SharedAccount = {
	sharedAccountId: string
}

type IdentificationType = {
	identificationTypeId: string,
	name: string
}

type CurrentUser = {
	id: string,
	cellPhoneNumber: string,
	email: string,
	userActive: boolean,
	userExist: boolean,
	person: Person
}

type Country = {
	countryId: string;
	code: string;
	name: string;
}
type Region = {
	regionId: number;
	name: string;
	country: Country,
}
type State = {
	stateId: number;
	name: string;
	country: Country,
	region: Region,
}
type City = {
	cityId: number;
	name: string;
	country: Country,
	region: Region,
	state: State,
}
type District = {
	districtId: number;
	name: string;
	country: Country,
	region: Region,
	state: State,
	city: City,
}
type SimpleDistrict = {
	id: number,
	text: string,
};
type SimpleCity = {
	id: number,
	text: string,
	districts: SimpleDistrict[]
};
type SimpleState = {
	id: number,
	text: string,
	cities: SimpleCity[]
};

type PersonAddress = {
	alias: string;
	personAddressId: string;
	mainStreet: string;
	secundaryStreet: string;
	propertyNumber: string;
	sector: string;
	reference: string;
	personAddressTypeId: string;
	personAddressTypeName: string;
	disctrictBean: District;
	homeTypeId: string;
	homeTypeName: string;
	longitude: number;
	latitude: number;
	urbanization: string;
	isDefault: number;
	personId: number;
}
type PersonPhone = {
	personPhoneId: string;
	typePhoneNumberId: string;
	typePhoneNumberName: string;
	areaCode: string;
	stateCode: string;
	number: string;
	extension: string;
	personAddressId: string;
	isDefault: number;
	personId: number;
}

type Person = {
	creditLimit: number,
	discountRate: number,
	email: string,
	externalCode: string,
	firstName: string,
	genderId: string,
	identification: string,
	identificationTypeId: string,
	maternalSurname: string,
	name: string,
	paternalSurname: string,
	personId: number,
	personTypeId: string,
	personTypeName: string,
	secondName: string,
	birthDate: date,
	birthDateAsString: string,
	sharedAccounts: SharedAccount[],
	addresses: PersonAddress[],
	phones: PersonPhone[],
	salesExecutive: string
}

type Password = {
	oldPassword: string,
	newPassword: string,
	newRepeatPassword: string,
	resetPasswordCode: string
}

type ItemResponse = {
	status: string;
	message: string;
	lastPage: number;
	currentPage: number;
	token: string;
	objectList: [Product];
}

type Product = {
	id: string;
	balanceCount: number;
	availibilityCount: number;
	categoryId: string;
	code: string;
	description: string;
	discount: number;
	name: string;
	paymentTypeId: string;
	newPrice: number;
	oldPrice: number;
	ratingsCount: number;
	ratingsValue: number;
	brandId: string;
	brandName: string;
	allowsNegativeStock: boolean;
	countryId: string,
	countryName: string
};

type Group = {
	id: string;
	name: string;
	groups: Group[];
};

type Detail = {
	id: string;
	cartCount: number;
}
type Invoice = {
	posId: string;
	isExternal: number;
	posName: string;
	channelId: string;
	code: string;
	id: string;
	accountInvoiceid: string;
	branchId: number;
	branchName: string;
	totalAmount: number;
	balance: number;
	paymentValue: number;
	issueDate: Date;
	collectedDate: Date;
	dueDate: string;
	personId: number;
	offRoute: boolean;
	remark: string;
	priceListId: string;
	collectionBox: string;
	name: string;
	voucher: string;
	authorizeInvoice: number;
	person: Person;
	paymentTypeId: string;
	paymentTypeName: string;
	personAddressId: string;
	reportId: string;
	oxusersSalesExecutive: string;
}
