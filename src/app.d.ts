// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Locals {}
	// interface PageData {}
	// interface PageError {}
	// interface Platform {}
}

// 🆕 NAVEGACIÓN PERSISTENTE - Tipos para estado de filtros
type FilterState = {
	textToSearch: string | null;
	selectedBrand: CatalogBrand | null;
	selectedGroup: CatalogGroup | null;
	selectedSubgroup: CatalogSubgroup | null;
	currentPage: number;
	totalProducts: number;
	scrollPosition: number;
	timestamp: number;
}

interface ImportMetaEnv {
	VITE_URL_API: string,
	VITE_API_KEY: string,
	VITE_CATALOG_URL?: string // Optional: URL for catalog-relations.json (defaults to /catalog-relations.json)
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
	salesExecutive: string,
	priceListId: string
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
	availibilityCountInCart: number;
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
	countryId: string;
	countryName: string;
	taxPercentage: number;
};

type Group = {
	id: string,
	name: string,
	groups: Group[],
};

type Brand = {
	id: string,
	name: string,
};

// Extended types for catalog relations
type CatalogBrand = {
	id: string,
	name: string,
	groupIds: string[],
	subgroupIds: string[]
};

type CatalogGroup = {
	id: string,
	name: string,
	brandIds: string[],
	subgroupIds: string[],
	parentId: string | null
};

type CatalogSubgroup = {
	id: string,
	name: string,
	brandIds: string[],
	groupId: string
};

type CatalogData = {
	brands: CatalogBrand[],
	groups: CatalogGroup[],
	subgroups: CatalogSubgroup[]
};

type CatalogRelationsFile = {
	lastUpdated: string,
	version: string,
	catalog: CatalogData
};

type Detail = {
	id: string;
	cartCount: number;
}
type Invoice = {
	posId: string | undefined;
	isExternal: number;
	posName: string | undefined;
	channelId: string | undefined;
	code: string | undefined;
	id: string | undefined;
	accountInvoiceid: string | undefined;
	branchId: number | undefined;
	branchName: string | undefined;
	totalAmount: number | undefined;
	balance: number | undefined;
	paymentValue: number | undefined;
	issueDate: Date | undefined;
	collectedDate: Date | undefined;
	dueDate: string | undefined;
	personId: number | undefined;
	offRoute: boolean | undefined;
	remark: string | undefined;
	priceListId: string | undefined;
	collectionBox: string | undefined;
	name: string | undefined;
	voucher: string | undefined;
	authorizeInvoice: number | undefined;
	person: Person | undefined;
	paymentTypeId: string | undefined;
	paymentTypeName: string | undefined;
	personAddressId: string | undefined;
	reportId: string | undefined;
	oxusersSalesExecutive: string | undefined;
	discountRate: number = 0;
}

type EmailNotification = {
	subject: string;
	message: string;
	deliveredTo: string;
}

type ApiResponse = {
	status: string;
	body?: any;
	message: string;
};

type Credentials = {
	username: string;
	password: string;
	token: string | null;
};

