import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { ScaledSheet, moderateScale, scale } from "react-native-size-matters";
import { Typography, TypographyType } from "../../../src/components/Typography";
import { LoginManager, GraphRequest, GraphRequestManager, AccessToken } from 'react-native-fbsdk';
import { facebook } from "../../../src/app/facebook";
import { Button, Paragraph, Dialog, Portal, Colors } from 'react-native-paper';
import Realm from 'realm';
import { dataRealmConfig } from "../../../src/stores/dataRealmConfig";

export class RealmDemo extends React.Component {
    private realm: Realm | null;

    public constructor(props: object) {
        super(props);

        this.realm = null;

        // OPEN REALM
        Realm.open(dataRealmConfig)
            .then(realm => {
                this.realm = realm;
            })
            .catch(error => {
                console.warn(error);
            });
    }

    private closeRealm() {
        if (this.realm && !this.realm.isClosed) {
            this.realm.close();
        }
    }

    private getPath() {
        if (!this.realm) return;

        console.warn(this.realm.path);
    }

    render() {
        return (
            <ScrollView contentContainerStyle={{ flex: 1, padding: 24, alignItems: 'center' }}>
                <Typography type={TypographyType.headingSecondary}>
                    Realm
                </Typography>

                <Button mode="contained" uppercase={false} onPress={() => { this.getPath() }} color={Colors.blue700}>
                    Get path
                </Button>
                <View style={{ height: scale(10) }} />

                <Button mode="contained" uppercase={false} onPress={() => { this.closeRealm() }} color={Colors.blue700}>
                    Close realm
                </Button>
                <View style={{ height: scale(10) }} />
            </ScrollView>
        );
    }
}