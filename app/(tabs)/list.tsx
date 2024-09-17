import { Link } from "expo-router";
import { View } from "react-native";
import TestBar from "@/components/TestBar";
const ListPage = () => {
  return (
    <View>
      <Link href="/list/1">News 1</Link>
      <Link href="/novel/2">novel 2</Link>
      <Link href="/list/3">News 3</Link>
      <TestBar/>
    </View>
  );
}

export default ListPage;