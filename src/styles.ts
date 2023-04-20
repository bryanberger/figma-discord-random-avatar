// Run `figma.getLocalPaintStyles().map((t) => ({ key: t.key, name: t.name }));` in the console to get a list of styleIds from a library.
// These are from: https://www.figma.com/file/4D0e5se4L922tFF5ZDgVZV/Tools---Avatars?node-id=0-1&t=FiSebRgTnxJkBdyP-0
// We search the name for the category to filter by, so ensure your folder structure is setup in a similar way.
export type Style = {
  key: string;
  name: string;
};

export const styles = [
  {
    key: "5b7d1dc59fc08920e75e163ac9cd6954bb21cdf6",
    name: "Avatars/People/Henri",
  },
  {
    key: "7d606f375beac8204132b187af524856400135a9",
    name: "Avatars/People/Rian",
  },
  {
    key: "42bb0d9e002228ee48c240845e904ded24ce8626",
    name: "Avatars/People/Dimitri",
  },
  {
    key: "fbca6cb6f6f90921b6f4cbf0665a0545c84d03b5",
    name: "Avatars/People/Cyberpunk A",
  },
  {
    key: "3ec9c6a1a9de287e4e26d4ac8df10a3d72079613",
    name: "Avatars/People/Cyberpunk B",
  },
  {
    key: "0201b4ef2b3494c6db1eca5d82af4600d33a83f6",
    name: "Avatars/People/Milad",
  },
  {
    key: "03bd6545348a1796d1ac3409435dc26c375ecfe0",
    name: "Avatars/People/Demorrisa",
  },
  {
    key: "b1871b81d0cbbe087966802d58b20df2e8b7ad32",
    name: "Avatars/People/Patricia",
  },
  {
    key: "5657eec47c37f73faf396d198e5121ee982a4bf8",
    name: "Avatars/Abstract/Enterprise",
  },
  {
    key: "e41be5a8fabae3da8630d7d3c9515fe0b84458f9",
    name: "Avatars/Abstract/Red Sun",
  },
  {
    key: "f88d1736c65fef290f9f1b06e5787777a511d979",
    name: "Avatars/Abstract/Lines",
  },
  {
    key: "3a62502029644e691fe2d18259eb3745a7db2f29",
    name: "Avatars/Abstract/System",
  },
  {
    key: "501a0db73de61ab534050d25a96e7d88fe7c4df9",
    name: "Avatars/Abstract/Geometry",
  },
  {
    key: "4a2e7000df02407019237c1b3d72682e8961a5a3",
    name: "Avatars/Abstract/Liquid",
  },
  {
    key: "95772c4617e24480573251388808c6c2e5a8e947",
    name: "Avatars/Abstract/Geo",
  },
  {
    key: "15f68c431f56e1e90dde8a1ef6048c82883dcfbb",
    name: "Avatars/Abstract/Wave",
  },
  {
    key: "b033ef68bd9db8c6287e91c0c940f36e237d172d",
    name: "Avatars/Abstract/Dude",
  },
  {
    key: "b4122052821a6a739c30507573059549cda08304",
    name: "Avatars/Abstract/Symmetry",
  },
  {
    key: "2588fa238e053dec2ee8b484fa5378967e07e310",
    name: "Avatars/Other/Guy",
  },
  {
    key: "7f5154cfc79d17d7bfdddfc344c81c93842a9bba",
    name: "Avatars/Other/Notice Me Wumpus",
  },
  {
    key: "0a218a00bfb8740f774ef1a83ab6b84864f36698",
    name: "Avatars/Other/Happy Face",
  },
  {
    key: "a61c6774b34bdb1e2b5a199e2e91aa45fe01e6a4",
    name: "Avatars/Other/Fernando the Hando",
  },
  {
    key: "50061cc8363b9cd31095670f029e35bc74211eba",
    name: "Avatars/Other/Human Man",
  },
  {
    key: "97d643ddb51f4f097f1d2a0734ca2e4b0ddb32ad",
    name: "Avatars/Other/Horse",
  },
  {
    key: "8aa085199aa0860f9046392a1b2c9e154c672a6d",
    name: "Avatars/Other/Cat",
  },
  {
    key: "4888e3780f82890eab17eb5cf54cd10fe8cf2f36",
    name: "Avatars/Other/Beak V",
  },
  {
    key: "07d25d4b802d32ee5534a8ec558b6f7907e0762c",
    name: "Avatars/Other/Think",
  },
  {
    key: "bfe88aed48a8781bcf8b6d8e1913c89a619bc1f6",
    name: "Avatars/Other/Music",
  },
  {
    key: "4bff78e9fde43051643be8e01e0ff1f8dbd76f4f",
    name: "Avatars/Other/Brain",
  },
  {
    key: "03346e137f9d3ded9cbb0dfdf08a511ec058be5c",
    name: "Avatars/Other/Nani",
  },
  {
    key: "93456b4762bb6898ceb33f04f46b5503e3438e96",
    name: "Avatars/Other/Sweaty",
  },
  {
    key: "f6c02072d305fe4e8ca174d88c59c350e937efef",
    name: "Avatars/Other/Monster",
  },
  {
    key: "d3be969cedce20a27d23c2a7a7afd6c3e5268537",
    name: "Avatars/Other/Future",
  },
  {
    key: "72d8068255dbc5be324796f8fa39fe486ca4d533",
    name: "Avatars/Other/Cool Wumpus",
  },
  {
    key: "391e52d7825aed7ac537abacc96c5ee0b75623cf",
    name: "Avatars/Other/Chin",
  },
  {
    key: "9cf98d9e1ba3ca0be27d07bed6960571c9e248ee",
    name: "Avatars/Other/Wumpus Butt",
  },
  {
    key: "ea6aa4164b5e1397d3cf32b60dcb37a03c912321",
    name: "Avatars/Other/Sonic",
  },
  {
    key: "36d5144e92d5f15176249e6239848af332829c7f",
    name: "Avatars/Other/Thumb",
  },
  {
    key: "d2b280d23f336e270621d0ddc1509911f5b2fa86",
    name: "Avatars/Other/Evil Face",
  },
  {
    key: "8bdc9a6899990aa84938aeabf958d59a4b1f88a8",
    name: "Avatars/Other/Cool Dude",
  },
  {
    key: "d1f115a09a7fdac71e41fdb0565aa3a808bd945e",
    name: "Avatars/Other/Flying Dude",
  },
  {
    key: "c6653594e8a5e63126c68b09c74fc735156ab424",
    name: "Avatars/Other/Ghost",
  },
  {
    key: "5bfae3b555b8b45342fdc4d79df415bbb1fd4ba8",
    name: "Avatars/Other/Pumpkin",
  },
  {
    key: "327fb2e4eb217748f4bfaf9778e07abac481c7da",
    name: "Avatars/Other/Dogg",
  },
  {
    key: "8dc31e35d68bac860bf81f3f3ae73cd2f1efd886",
    name: "Avatars/Other/Astronaut",
  },
  {
    key: "287f5e535cabf9b0513942243540be4b97039357",
    name: "Avatars/Other/Kawaii",
  },
  {
    key: "04f2e7b812e511dbec3a980d46cd48b18da15207",
    name: "Avatars/Hypesquad/Brilliance",
  },
  {
    key: "67ac609d37706568c42e903f997b9c596e5ebb03",
    name: "Avatars/Hypesquad/Bravery",
  },
  {
    key: "c880ee61cad8c094add907a7af84783a9f409740",
    name: "Avatars/Hypesquad/Balance",
  },
  {
    key: "94f5f00f581420b8dbdfa32e776bf29b9a32a453",
    name: "Avatars/Characters/Bloo",
  },
  {
    key: "bcc4ca6e5c67e7516be9a18a03f7b62ecfbc84ff",
    name: "Avatars/Characters/Bird",
  },
  {
    key: "2dd52661325e3b23df5bd1c6b3ba66d0f15d89b8",
    name: "Avatars/Characters/Boom",
  },
  {
    key: "afe45209c746b954fa4fd612c61b3837f955be17",
    name: "Avatars/Characters/Bonbon",
  },
  {
    key: "74ec83fb930b8c78013c1511fb3cc9c72f5bffaf",
    name: "Avatars/Characters/Cap",
  },
  {
    key: "cc3aba9342892c5ddae50b973ef5a40f92772a2d",
    name: "Avatars/Characters/Cherry",
  },
  {
    key: "e6580e289ac436433943e56279fd137ec527d49e",
    name: "Avatars/Characters/Graggle",
  },
  {
    key: "63d8f8d344007485fc664fcb391fd7d12dff8442",
    name: "Avatars/Characters/Locke",
  },
  {
    key: "85787fe39a580e0d978b1943452f00b90d9936d8",
    name: "Avatars/Characters/Mallow",
  },
  {
    key: "1ddb43def25a766746dac5d7b8b67b9ea84bdfc5",
    name: "Avatars/Characters/Nelly",
  },
  {
    key: "fe4975d3847e92e6b2393febb4ab7e30f8e12006",
    name: "Avatars/Characters/Pen",
  },
  {
    key: "a919e6f01de3defcc57c9416c347087f30cca21d",
    name: "Avatars/Characters/Phibi",
  },
  {
    key: "157718c4db84166240341bd6c6959f86af016fb9",
    name: "Avatars/Characters/Pod",
  },
  {
    key: "1b2cf78c49317976a646c64857befaaa275e6af3",
    name: "Avatars/Characters/Slurp",
  },
];
