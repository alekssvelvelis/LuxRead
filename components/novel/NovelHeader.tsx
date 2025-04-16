import React, { useState, memo, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { Appbar } from 'react-native-paper';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import ExpandableDescription from '@/components/novel/ExpandableDescription';
import ModalComponent from '../ModalComponent';

interface NovelHeaderProps {
    appliedTheme: any;
    novelData: any;
    imageURL: string;
    genresArray: string[];
    shareNovel: () => void;
    chapterList: any[];
    readingProgress: any;
    onReadPress: () => void;
    routerBack: () => void;
    downloadMultipleChapters: (startIndex: number, endIndex: number) => void;
}

const NovelHeader = ({ appliedTheme, novelData, imageURL, genresArray, shareNovel, chapterList, readingProgress, onReadPress, routerBack, downloadMultipleChapters }: NovelHeaderProps) => {
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [chaptersCountToDownload, setChaptersCountToDownload] = useState<string>('1');
    const [downloadStartChoice, setDownloadStartChoice] = useState<'first' | 'latest'>('first');
    const [error, setError] = useState<string | null>(null);

    const chaptersInputRef = useRef<TextInput>(null);
    const handleChangeText = (value: string) => {
        setError(null);
        if (value === '') {
            setChaptersCountToDownload(value);
            return;
        }
        const inputNumber = parseInt(value);
        if (!isNaN(inputNumber) && inputNumber > novelData.chapterCount) {
            setChaptersCountToDownload(novelData.chapterCount.toString());
            setError('Your number exceeds the maximum available chapters.');
            chaptersInputRef.current?.blur();
        } else {
            setChaptersCountToDownload(value);
        }
    };

    const handleDownloadPress = () => {
        setModalVisible(true);
    };

    const handleCancel = () => {
        setModalVisible(false);
    };

    const handleConfirmDownload = () => {
        const startingIndex = downloadStartChoice === 'first' ? 1 : readingProgress.chapterIndex;
        console.log(startingIndex, 'inside of novelHeader.tsx goes till', parseInt(chaptersCountToDownload));
        downloadMultipleChapters(startingIndex, parseInt(chaptersCountToDownload));
    }

    // React-native-paper uses MaterialCommunityIcons.
    // if you want to use other icons while not having them re-render you can use this
    // const renderShareIcon = useMemo(() => {
    //     return () => <MaterialIcons name="share" size={24} color={appliedTheme.colors.text} />;
    // }, [appliedTheme.colors.text]);

    // const renderDownloadIcon = useMemo(() => {
    //     return () => <MaterialIcons name="file-download" size={24} color={appliedTheme.colors.text} />;
    // }, [appliedTheme.colors.text]);

    let isNovelSaved = novelData.id !== '[id]' ? typeof JSON.parse(novelData.id) === 'number' : false;
    return (
        <View style={{ minWidth: '100%' }}>
            <Appbar.Header mode="small" style={{ backgroundColor: appliedTheme.colors.elevation.level2 }}>
                <Appbar.BackAction onPress={routerBack} color={appliedTheme.colors.text} style={{ marginLeft: -8 }} />
                <Appbar.Content title={novelData.title} titleStyle={{ color: appliedTheme.colors.text }} />
                <Appbar.Action
                    icon="share-outline"
                    color={appliedTheme.colors.text}
                    onPress={shareNovel}
                />
                { isNovelSaved && (
                    <Appbar.Action
                        icon="download"
                        color={appliedTheme.colors.text}
                        onPress={handleDownloadPress}
                    />
                )}
            </Appbar.Header>
            <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 0.5, alignItems: 'center' }}>
                    <Image
                        source={{ uri: imageURL }}
                        style={{ width: 175, height: 175, marginVertical: 12 }}
                        contentFit="contain"
                    />
                </View>
                <View style={{ flex: 1, marginVertical: 12 }}>
                    <Text style={[{ fontSize: 22, marginTop: 12, marginHorizontal: 8, fontWeight: 'bold' }, { color: appliedTheme.colors.primary }]}>
                        {novelData.title}
                    </Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Ionicons size={20} name="person-outline" style={{ marginHorizontal: 8 }} color={appliedTheme.colors.text} />
                        <Text style={{ color: appliedTheme.colors.onSurfaceVariant }}>{novelData.author}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Ionicons size={24} name="book-outline" style={{ marginHorizontal: 8 }} color={appliedTheme.colors.text} />
                        <Text style={{ color: appliedTheme.colors.onSurfaceVariant, fontSize: 14 }}>
                            {novelData.chapterCount} Chapters {novelData.novelStatus ? '/ ' + novelData.novelStatus : '/ Unknown'}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <MaterialIcons size={24} name="source" style={{ marginHorizontal: 8 }} color={appliedTheme.colors.text} />
                        <Text style={{ color: appliedTheme.colors.onSurfaceVariant, fontSize: 14 }}>
                            {novelData.sourceName}
                        </Text>
                    </View>
                </View>
            </View>
            <FlatList
                style={{ maxHeight: 52, marginBottom: 12 }}
                data={genresArray}
                horizontal
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexDirection: 'row', marginTop: 12 }}
                renderItem={({ item }) => (
                    <View
                        style={{
                            borderRadius: 15,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            marginRight: 8,
                            marginBottom: 8,
                            height: 32,
                            backgroundColor: appliedTheme.colors.primary,
                        }}
                    >
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: appliedTheme.colors.text }}>
                            {item}
                        </Text>
                    </View>
                )}
            />
            <ExpandableDescription description={novelData.description} />
            {chapterList.length > 0 && (
                <View style={{ alignItems: 'center' }}>
                    <Text
                        numberOfLines={1}
                        onPress={onReadPress}
                        style={{
                            fontSize: 16,
                            color: appliedTheme.colors.text,
                            backgroundColor: appliedTheme.colors.primary,
                            padding: 12,
                            borderRadius: 50,
                            marginBottom: 12,
                        }}
                    >
                        {readingProgress.chapterIndex > 0
                            ? `Continue reading ${chapterList[readingProgress.chapterIndex - 1].title}`
                            : `Start reading ${chapterList[0].title}`}
                    </Text>
                </View>
            )}
            <ModalComponent visible={modalVisible} onClose={handleCancel}>
                <View style={{ width: '100%', backgroundColor: appliedTheme.colors.surfaceVariant, padding: 12, borderRadius: 12 }}>
                    <Text style={{ fontSize: 16, marginBottom: 12, color: appliedTheme.colors.text }}>
                        Download Chapters
                    </Text>
                    <Text style={{ fontSize: 14, marginBottom: 8, color: appliedTheme.colors.text }}>
                        Start from:
                    </Text>
                    <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                        <TouchableOpacity
                            onPress={() => setDownloadStartChoice('first')}
                            style={{
                                padding: 10,
                                backgroundColor: downloadStartChoice === 'first' ? appliedTheme.colors.primary : '#777',
                                borderRadius: 4,
                                marginRight: 10,
                            }}
                        >
                            <Text style={{ color: '#fff' }}>1st Chapter</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setDownloadStartChoice('latest')}
                            style={{
                                padding: 10,
                                backgroundColor: downloadStartChoice === 'latest' ? appliedTheme.colors.primary : '#777',
                                borderRadius: 4,
                            }}
                        >
                            <Text style={{ color: '#fff' }}>Latest Read</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={{ fontSize: 14, marginBottom: 8, color: appliedTheme.colors.text }}>
                        Download up to chapter:
                    </Text>
                    <TextInput
                        ref={chaptersInputRef}
                        keyboardType="numeric"
                        value={chaptersCountToDownload}
                        onChangeText={handleChangeText}
                        placeholderTextColor={appliedTheme.colors.onSurfaceVariant}
                        placeholder="Enter a chapter number"
                        style={{
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 4,
                            marginBottom: 8,
                            padding: 8,
                            color: appliedTheme.colors.text,
                        }}
                    />
                    <Text style={{color: 'red', marginBottom: 8}}>{error}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                        <TouchableOpacity
                            style={{
                                backgroundColor: '#FF6B6B',
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                                borderRadius: 6,
                                marginRight: 12,
                            }}
                            onPress={handleCancel}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>CANCEL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                backgroundColor: 'lightgreen',
                                paddingVertical: 10,
                                paddingHorizontal: 10,
                                borderRadius: 6,
                                marginRight: 12,
                            }}
                            onPress={handleConfirmDownload}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>CONFIRM</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                        Minimum: {downloadStartChoice === 'first' ? '1' : readingProgress.chapterIndex || '1'}, Maximum: {novelData.chapterCount}
                    </Text>
                </View>
            </ModalComponent>
        </View>
    );
};

export default memo(NovelHeader);