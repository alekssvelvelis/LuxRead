import { Link } from "expo-router";
import { View } from "react-native";
import React from 'react';
import NovelSkeleton from "@/components/skeletons/NovelSkeleton";
const ListPage = () => {
  return (
    <View>
      <NovelSkeleton></NovelSkeleton>
      {/* <Link href="/list/1">News 1</Link>
      <Link href="/novel/2">novel 2</Link>
      <Link href="/list/3">News 3</Link> */}
    </View>
  );
}

export default ListPage;