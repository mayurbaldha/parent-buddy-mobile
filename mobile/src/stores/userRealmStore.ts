import Realm, { ObjectSchema, Collection } from 'realm';
import { userRealmConfig } from "./userRealmConfig";
import { VariableEntity, VariableEntitySchema } from './VariableEntity';
import { appConfig } from '../app/appConfig';
import { ChildEntity } from '.';
import { ChildEntitySchema, ChildGender, Measures } from './ChildEntity';
import { DateTime } from 'luxon';
import { translateData, TranslateDataInterpretationLenghtForAge, TranslateDataInterpretationWeightForHeight, TranslateDataDoctorVisitPeriods, TranslateDataImmunizationsPeriods } from '../translationsData/translateData';
import { ChartData as Data, GrowthChart0_2Type, GrowthChartHeightAgeType } from '../components/growth/growthChartData';
import { dataRealmStore } from './dataRealmStore';
import { InterpretationText } from '../screens/growth/GrowthScreen';
import { Child } from '../screens/home/ChildProfileScreen';
import RNFS from 'react-native-fs';
import { UserRealmContextValue } from './UserRealmContext';
import { utils } from '../app/utils';
import { Props as DoctorVisitCardProps, DoctorVisitCardItemIcon, DoctorVisitCardButtonType } from '../components/doctor-visit/DoctorVisitCard';
<<<<<<< HEAD
import { getDoctorVisitCardsNoBirthday } from './functions/getDoctorVisitCards';
=======
import { getDoctorVisitCardsBirthdayIsNotSet } from './functions/getDoctorVisitCards';
>>>>>>> 0cf37e644ea07b2b675a2b25770b3cbff67f6480
import { Vaccine, VaccinationPeriod } from '../components/vaccinations/oneVaccinations';

type Variables = {
    'userChildren': any;
    'userData': any;
    'checkedMilestones': any;
};

type VariableKey = keyof Variables;

class UserRealmStore {
    public realm?: Realm;
    private static instance: UserRealmStore;

    private constructor() {
        this.openRealm();
    }

    static getInstance(): UserRealmStore {
        if (!UserRealmStore.instance) {
            UserRealmStore.instance = new UserRealmStore();
        }
        return UserRealmStore.instance;
    }

    public async openRealm(): Promise<Realm | null> {
        return new Promise((resolve, reject) => {
            if (this.realm) {
                resolve(this.realm);
            } else {
                // Delete realm file
                if (appConfig.deleteRealmFilesBeforeOpen) {
                    Realm.deleteFile(userRealmConfig);
                }

                // Open realm file
                Realm.open(userRealmConfig)
                    .then(realm => {
                        this.realm = realm;
                        resolve(realm);
                    })
                    .catch(error => {
                        resolve(null);
                    });
            }
        });
    }

    public closeRealm() {
        if (this.realm) {
            this.realm.close();
            delete this.realm;
        }
    }

    public isRealmClosed(): boolean {
        let rval = true;

        if (this.realm) {
            rval = this.realm.isClosed;
        }

        return rval;
    }


    public getCurrentChild = () => {
        let childId = dataRealmStore.getVariable('currentActiveChildId');
        if (childId) {
            return this.realm?.objects<ChildEntity>(ChildEntitySchema.name).filtered(`uuid == '${childId}'`).map(item => item)[0];
        } else {
            let child = this.realm?.objects<ChildEntity>(ChildEntitySchema.name).find((record, index) => index === 0);
            if (child) {
                dataRealmStore.setVariable('currentActiveChildId', child.uuid);
                return child;
            }
        }


    }

    public getPreviousVaccines() {
        let childBirthDay = this.getCurrentChild()?.birthDate;
        let receivedVaccinations = this.getAllReceivedVaccines();

<<<<<<< HEAD
        let vaccines: Vaccine[] = [];

        if (childBirthDay) {
            let childAgeInDays = this.getCurrentChildAgeInDays();

            const immunizationsPeriods = translateData('immunizationsPeriods') as (TranslateDataImmunizationsPeriods | null);


            let currentImmunizationsPeriods = immunizationsPeriods?.find(period => period.dayStart <= childAgeInDays && period.dayEnd >= childAgeInDays);

            if (currentImmunizationsPeriods && immunizationsPeriods) {
                // get all vaccines for previous period 
                for (let i = 0; i < immunizationsPeriods?.length; i++) {
                    if (immunizationsPeriods[i].uuid === currentImmunizationsPeriods.uuid) {
                        break;
                    };

                    vaccines = vaccines.concat(immunizationsPeriods[i].vaccines.map(vaccine => {
                        return {
                            complete: false,
                            title: vaccine.title,
                            hardcodedArticleId: vaccine.hardcodedArticleId,
                            uuid: vaccine.uuid,
                        }
                    }));
                };
            };

            // If received vaccinations is empty return all previous vaccination
            if (receivedVaccinations === null || receivedVaccinations === undefined || receivedVaccinations.length === 0) {
                vaccines = vaccines;
            } else {
                let recivedVaccinationIds: string[] = []

                // get array of ids for every received vaccine 
                receivedVaccinations.forEach(item => {
                    item.uuid.forEach(uid => {
                        recivedVaccinationIds.push(uid.toString());
                    })
                });

                let finalyVaccinesList: Vaccine[] = []

                /*
                * Compare received vaccines with vaccines for previous period 
                * Return all nonReceived vaccines 
                */ 
                vaccines.forEach(item => {
                    if (recivedVaccinationIds.indexOf(item.uuid) === -1) {
                        finalyVaccinesList.push(item)
                    }
                });
                vaccines = finalyVaccinesList;
            }
        };


        return vaccines;
    }

    public getVaccinationsForCurrentPeriod() {
        let childBirthDay = this.getCurrentChild()?.birthDate;
        let vaccines: Vaccine[] = [];

        if (childBirthDay) {
            let childAgeInDays = this.getCurrentChildAgeInDays();

            const immunizationsPeriods = translateData('immunizationsPeriods') as (TranslateDataImmunizationsPeriods | null);

            let currentImmunizationsPeriods = immunizationsPeriods?.find(period => period.dayStart <= childAgeInDays && period.dayEnd >= childAgeInDays);

            if (currentImmunizationsPeriods) {
                vaccines = currentImmunizationsPeriods.vaccines.map(vaccine => {
                    return {
                        complete: false,
                        title: vaccine.title,
                        hardcodedArticleId: vaccine.hardcodedArticleId,
                        uuid: vaccine.uuid,
                    };
                });
            };
        };

        return vaccines;
    };

    public getAllReceivedVaccines() {
=======
    /* VACCINATIONS */

    public getAllRecivedVaccines() {
>>>>>>> 0cf37e644ea07b2b675a2b25770b3cbff67f6480
        let allMeasures = this.getAllMeasuresForCurrentChild();

        let rval: VaccineForPeriod[] = [];

        allMeasures.forEach(measure => {
            if (measure.vaccineIds !== null && measure.vaccineIds !== undefined && measure.vaccineIds.length > 0) {
                rval.push({ uuid: measure.vaccineIds, date: measure.measurementDate });
            };
        });

        return rval;
    };

    public getVaccinesForSinglePeriod(receivedVaccination: VaccineForPeriod[], period: any): Vaccine[] {

        let allVaccines: Vaccine[] = [];

        if (receivedVaccination.length !== 0) {
            period.vaccines.forEach(vaccine => {
                let isCompleted = false;
                let date: number | undefined = undefined;
                
                receivedVaccination.forEach(item => {
                    if (item.uuid.indexOf(vaccine.uuid) !== -1) {
                        isCompleted = true;
                        date = item.date;
                    } 
                });

                allVaccines.push({
                    title: vaccine.title,
                    uuid: vaccine.uuid,
                    complete: isCompleted,
                    hardcodedArticleId: vaccine.hardcodedArticleId,
                    recivedDateMilis: date
                });
            });

        } else {
            period.vaccines.forEach(vaccine => {
                let isCompleted = false;
                allVaccines.push({
                    title: vaccine.title,
                    uuid: vaccine.uuid,
                    complete: isCompleted,
                    hardcodedArticleId: vaccine.hardcodedArticleId,

                });
            });
        };

        return allVaccines;
    };

    public getAllVaccinationPeriods(): VaccinationPeriod[] {

        let rval: VaccinationPeriod[] = [];
        let isBirthDayEntered = false;

        const childBirthDay = this.getCurrentChild()?.birthDate;
        const immunizationsPeriods = translateData('immunizationsPeriods') as (TranslateDataImmunizationsPeriods | null);

        if (childBirthDay) {
            const childAgeInDays = this.getCurrentChildAgeInDays();
            const recivedVaccination = this.getAllReceivedVaccines();

            let isCurrentPeriod = false;
            let isFeaturedPeriod = false;

            isBirthDayEntered = true;

            immunizationsPeriods?.forEach(period => {

                // Get current period 
                if (childAgeInDays >= period.dayStart && childAgeInDays <= period.dayEnd) {
                    isCurrentPeriod = true;
                } else {
                    isCurrentPeriod = false;
                }

                // Get featured periods 
                if (childAgeInDays < period.dayStart) {
                    isFeaturedPeriod = true;
                }

                rval.push({
                    isCurrentPeriod: isCurrentPeriod,
                    title: period.title,
                    isBirthDayEntered: isBirthDayEntered,
                    vaccineList: this.getVaccinesForSinglePeriod(recivedVaccination, period),
                    isFeaturedPeriod: isFeaturedPeriod,
                })
            });
        } else {
            isBirthDayEntered = false;

            immunizationsPeriods?.forEach(period => {
                rval.push({
                    isCurrentPeriod: false,
                    title: period.title,
                    isBirthDayEntered: isBirthDayEntered,
                    vaccineList: period.vaccines.map(item => {
                        return {
                            title: item.title,
                            uuid: item.uuid,
                            complete: false,
                            hardcodedArticleId: item.hardcodedArticleId
                        }
                    }),
                });
            });
        }


        return rval;
    };

    /**
     * Get child age in days.
     * 
     * If birthDayMillis is not given, current child birthday is taken.
     * 
     * If currentMillis is not given, current time is taken. If it is given,
     * days are calculated from birthDayMillis to given currentMillis.
     */
    public getCurrentChildAgeInDays = (birthDayMillis?: number, currentMillis?: number) => {
        let childBirthDay = birthDayMillis ? birthDayMillis : this.getCurrentChild()?.birthDate?.getTime();

        let timeNow = DateTime.local();
        if (currentMillis) {
            timeNow = DateTime.fromMillis(currentMillis);
        }

        let days: number = 0;

        if (childBirthDay) {
            let date = DateTime.fromMillis(childBirthDay);
            let convertInDays = timeNow.diff(date, "days").toObject().days;

            if (convertInDays !== undefined) days = convertInDays;
        };

        return days;
    };

    public getInterpretationLenghtForAge(gender: ChildGender, lastMeasurements: Measures) {
        const childAgeId = dataRealmStore.getChildAgeTagWithArticles()?.id;

        let interpretationText: InterpretationText | undefined = {
            name: "",
            text: "",
            articleId: 0
        };

        let goodMeasure: boolean | undefined = false;

        let chartData: GrowthChartHeightAgeType = [];

        if (gender === "boy") {
            chartData = Data.Height_age_boys0_5
        } else {
            chartData = Data.Height_age_girls0_5
        }

        let length: number = 0;
        if (lastMeasurements !== undefined && lastMeasurements.weight && lastMeasurements.length) {
            length = parseFloat(lastMeasurements.length);
        };

        const childBirthDay = userRealmStore.getCurrentChild()?.birthDate;
        let measurementDate: DateTime = DateTime.local();

        if (lastMeasurements !== undefined && lastMeasurements.measurementDate) {
            measurementDate = DateTime.fromJSDate(new Date(lastMeasurements.measurementDate));
        }

        let days = 0;

        if (childBirthDay) {
            let date = DateTime.fromJSDate(childBirthDay);
            let convertInDays = measurementDate.diff(date, "days").toObject().days;


            if (convertInDays !== undefined) days = Math.round(convertInDays);
        };
        let filteredData = chartData.find(data => data.Day === days);

        let allinterpretationData = translateData('interpretationLenghtForAge') as (TranslateDataInterpretationLenghtForAge | null)


        let interpretationData = allinterpretationData?.
            find(item => item.predefined_tags.indexOf(childAgeId ? childAgeId : 0) !== -1);


        if (filteredData !== undefined) {
            if (length >= filteredData.SD2neg && length <= filteredData.SD3) {
                interpretationText = interpretationData?.goodText;
                goodMeasure = true;
            };

            if (length < filteredData.SD2neg && length > filteredData.SD3neg) {
                interpretationText = interpretationData?.warrningSmallLengthText;
            };

            if (length < filteredData.SD3neg) {
                interpretationText = interpretationData?.emergencySmallLengthText;
            };
            if (length > filteredData.SD3) {
                interpretationText = interpretationData?.warrningBigLengthText;
            };
        };
        if (interpretationText && interpretationText.name === "") {
            goodMeasure = undefined
        }

        return {
            interpretationText: interpretationText,
            goodMeasure: goodMeasure
        };
    };

    public getInterpretationWeightForHeight(gender: ChildGender, childAgeInDays: number, lastMeasurements: Measures) {
        const dayLimit = 730; // 0-2 yeast || 2-5 years 
        const childAgeId = dataRealmStore.getChildAgeTagWithArticles()?.id;

        let interpretationText: InterpretationText | undefined = {
            name: "",
            text: "",
            articleId: 0
        };

        let goodMeasure: boolean | undefined = false;

        let chartData: GrowthChart0_2Type = [];

        if (gender === "boy") {
            if (childAgeInDays <= dayLimit) {
                chartData = Data.GrowthChartBoys0_2;
            } else {
                chartData = Data.GrowthChartBoys2_5;
            };
        } else {
            if (childAgeInDays <= dayLimit) {
                chartData = Data.GrowthChartGirls0_2;
            } else {
                chartData = Data.GrowthChartGirls2_5;
            };
        };

        let height: number = 0;
        let length: number = 0;

        if (lastMeasurements !== undefined && lastMeasurements.weight && lastMeasurements.length) {
            height = parseFloat(lastMeasurements.weight) / 1000;
            length = parseFloat(lastMeasurements.length);
        };

        let filteredDataForHeight = chartData.find(data => data.Height === length);

        let allInterpretationData = translateData('interpretationWeightForHeight') as (TranslateDataInterpretationWeightForHeight | null)

        let interpretationData = allInterpretationData?.
            find(item => item.predefined_tags.indexOf(childAgeId ? childAgeId : 0) !== -1);

        if (filteredDataForHeight) {
            if (height >= filteredDataForHeight?.SD2neg && height <= filteredDataForHeight.SD2) {
                interpretationText = interpretationData?.goodText;
                goodMeasure = true;
            };

            if (height <= filteredDataForHeight.SD2neg && height >= filteredDataForHeight.SD3neg) {
                interpretationText = interpretationData?.warrningSmallHeightText;
            };

            if (height < filteredDataForHeight.SD3neg) {
                interpretationText = interpretationData?.emergencySmallHeightText;
            };

            if (height >= filteredDataForHeight.SD2 && height <= filteredDataForHeight.SD3) {
                interpretationText = interpretationData?.warrningBigHeightText;
            };

            if (height > filteredDataForHeight.SD3) {
                interpretationText = interpretationData?.emergencyBigHeightText;
            };
        };

        if (interpretationText && interpretationText.name === "") {
            goodMeasure = undefined
        }

        return {
            interpretationText: interpretationText,
            goodMeasure: goodMeasure,
        };
    }

    public getChildGender = () => {
        let child = this.getCurrentChild()
        return child?.gender
    }

    public getAllChildren(context?: UserRealmContextValue): Child[] {
        let allChildren = context ?
            context.realm?.objects<ChildEntity>(ChildEntitySchema.name).map(child => child) :
            userRealmStore.realm?.objects<ChildEntity>(ChildEntitySchema.name).map(child => child);

        let currentChild = this.getCurrentChild()?.uuid;

        let allChildrenList: Child[] = [];

        if (allChildren) {

            allChildrenList = allChildren?.map(child => {
                let birthDay = child.birthDate ?
                    DateTime.fromJSDate(child.birthDate).toFormat("dd'.'MM'.'yyyy") : "";

                let imgUrl = child.photoUri ? utils.addPrefixForAndroidPaths(`${RNFS.DocumentDirectoryPath}/${child.photoUri}`) : null;
                let isCurrentActive = false;

                if (currentChild) {
                    if (currentChild === child.uuid) {
                        isCurrentActive = true;
                    }
                };

                return {
                    childId: child.uuid,
                    birthDay: birthDay,
                    name: child.name,
                    photo: imgUrl,
                    gender: child.gender,
                    isCurrentActive: isCurrentActive,
                    id: child.uuid,
                };
            });
        };


        return allChildrenList;
    };

    public async setVariable<T extends VariableKey>(key: T, value: Variables[T] | null): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!this.realm) {
                reject();
                return;
            }

            try {
                const allVariables = this.realm.objects<VariableEntity>(VariableEntitySchema.name);
                const variablesWithKey = allVariables.filtered(`key == "${key}"`);
                const keyAlreadyExists = variablesWithKey && variablesWithKey.length > 0 ? true : false;

                if (keyAlreadyExists) {
                    this.realm.write(() => {
                        variablesWithKey[0].value = JSON.stringify(value);
                        variablesWithKey[0].updatedAt = new Date();
                        resolve(true);
                    });
                }

                if (!keyAlreadyExists) {
                    this.realm.write(() => {
                        this.realm?.create<VariableEntity>(VariableEntitySchema.name, {
                            key: key,
                            value: JSON.stringify(value),
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        });
                        resolve(true);
                    });
                }
            } catch (e) {
                reject();
            }
        });
    }

    // public async setMilestone(T exte)

    public getVariable<T extends VariableKey>(key: T): Variables[T] | null {
        if (!this.realm) return null;

        try {
            const allVariables = this.realm.objects<VariableEntity>(VariableEntitySchema.name);
            const variablesWithKey = allVariables.filtered(`key == "${key}"`);

            if (variablesWithKey && variablesWithKey.length > 0) {
                const record = variablesWithKey.find(obj => obj.key === key);

                if (record) {
                    return JSON.parse(record.value);
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } catch (e) {
            return null;
        }
    }


    public async deleteVariable<T extends VariableKey>(key: T): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.realm) {
                reject();
                return;
            }

            try {
                const allVariables = this.realm.objects<VariableEntity>(VariableEntitySchema.name);
                const variablesWithKey = allVariables.filtered(`key == "${key}"`);

                if (variablesWithKey && variablesWithKey.length > 0) {
                    const record = variablesWithKey.find(obj => obj.key === key);

                    this.realm.write(() => {
                        this.realm?.delete(record);
                        resolve();
                    });
                } else {
                    reject();
                }
            } catch (e) {
                reject();
            }
        });
    }

    public async create<Entity>(entitySchema: ObjectSchema, record: Entity): Promise<Entity> {
        return new Promise((resolve, reject) => {
            if (!this.realm) {
                reject();
                return;
            }

            try {
                this.realm.write(() => {
                    this.realm?.create<Entity>(entitySchema.name, record);
                    resolve(record);
                });
            } catch (e) {
                reject();
            }
        });
    }

    public async delete(record: any): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.realm) {
                reject();
                return;
            }

            try {
                this.realm.write(() => {
                    this.realm?.delete(record);
                    resolve();
                });
            } catch (e) {
                reject();
            }
        });
    }

    public async deleteAll(entitySchema: ObjectSchema): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.realm) {
                reject();
                return;
            }

            try {
                const allRecords = this.realm?.objects(entitySchema.name);

                this.realm?.write(() => {
                    this.realm?.delete(allRecords);
                    resolve();
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    public async addMeasuresForCurrentChild(measures: Measures) {
        return new Promise((resolve, reject) => {
            const currentChild = this.getCurrentChild();
            if (!currentChild) {
                resolve();
                return;
            }

            try {
                let measuresString = currentChild.measures;
                if (!measuresString || measuresString === '') {
                    measuresString = '[]';
                }

                const measuresArray: Measures[] = JSON.parse(measuresString);
                measuresArray.push(measures);

                this.realm?.write(() => {
                    currentChild.measures = JSON.stringify(measuresArray);
                    resolve();
                });
            } catch (e) {
                resolve();
            }
        });
    }

    /**
     * Returns measures field for current child.
     */
    public getAllMeasuresForCurrentChild(): Measures[] {
        let rval: Measures[] = [];

        const currentChild = this.getCurrentChild();
        if (currentChild) {
            // Get measures
            let measuresString = currentChild.measures;

            if (!measuresString || measuresString === '') {
                measuresString = '[]';
            }

            rval = JSON.parse(measuresString);

            // Sort measures per measurementDate
            rval.sort((firstEl, secondEl) => {
                if ((firstEl.measurementDate as number) < (secondEl.measurementDate as number)) return -1;
                if ((firstEl.measurementDate as number) > (secondEl.measurementDate as number)) return 1;
                return 0;
            });
        }

        return rval;
    }

    /**
     * Returns all measures similar to getAllMeasuresForCurrentChild, but
     * divides them into regular and additional measures according to
     * doctorVisitPeriods.
     * 
     * doctorVisitPeriods are defined in translationsData->en for example.
     */
    public getRegularAndAdditionalMeasures() {
        const rval: {
            regularMeasures: { doctorVisitPeriodUuid: string, measures: Measures }[];
            additionalMeasures: Measures[];
        } = {
            regularMeasures: [],
            additionalMeasures: []
        };

        // Get current child
        const currentChild = this.getCurrentChild();

        if (!currentChild || !currentChild.birthDate) return rval;

        // Get all measures
        const allMeasuresForCurrentChild = this.getAllMeasuresForCurrentChild();
        if (allMeasuresForCurrentChild.length === 0) return rval;

        // Set doctorVisitPeriods
        const doctorVisitPeriods = translateData('doctorVisitPeriods') as (TranslateDataDoctorVisitPeriods);

        // Set regularMeasures, additionalMeasures
        allMeasuresForCurrentChild.forEach((currentMeasures) => {
            let childAgeInDaysForMeasure = this.getCurrentChildAgeInDays(
                currentChild.birthDate?.getTime(),
                currentMeasures.measurementDate,
            );

            // Set doctorVisitPeriodUuid
            let doctorVisitPeriodUuid: string | null = null

            doctorVisitPeriods.forEach((doctorVisitPeriod) => {
                if (
                    childAgeInDaysForMeasure >= doctorVisitPeriod.childAgeInDays.from
                    &&
                    childAgeInDaysForMeasure <= doctorVisitPeriod.childAgeInDays.to
                ) {
                    doctorVisitPeriodUuid = doctorVisitPeriod.uuid;
                }
            });

            // Add this measure to proper group
            if (doctorVisitPeriodUuid) {
                rval.regularMeasures.push({
                    doctorVisitPeriodUuid: doctorVisitPeriodUuid,
                    measures: currentMeasures,
                });
            } else {
                rval.additionalMeasures.push(currentMeasures);
            }
        });

        // Return
        return rval;
    }

    public getDoctorVisitCards(): DoctorVisitCardProps[] {
        let rval: DoctorVisitCardProps[] = [];

        const currentChild = this.getCurrentChild();
        if (!currentChild) return [];

        // Birthday is NOT given
        if (!currentChild.birthDate) {
            rval = getDoctorVisitCardsBirthdayIsNotSet();
        }

        // Birthday is given
        if (currentChild.birthDate) {

        }

        return rval;
    }
}

export type VaccineForPeriod = {
    uuid: string[];
    date: number | undefined;
}

export const userRealmStore = UserRealmStore.getInstance();