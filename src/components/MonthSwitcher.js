// import React from 'react';
// import { View, Text, TouchableOpacity } from 'react-native';
// import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
// import { colors } from '../constants/theme';
// import { addMonths, monthLabel } from '../utils/format';

// export default function MonthSwitcher({ date, onChange, disabled }) {
//   return (
//     <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: disabled ? 0.4 : 1, marginBottom: 12 }}>
//       <TouchableOpacity disabled={disabled} onPress={() => onChange(addMonths(date, -1))} hitSlop={10}>
//         <Icon name="chevron-left" size={28} color={colors.text} />
//       </TouchableOpacity>
//       <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{monthLabel(date)}</Text>
//       <TouchableOpacity disabled={disabled} onPress={() => onChange(addMonths(date, 1))} hitSlop={10}>
//         <Icon name="chevron-right" size={28} color={colors.text} />
//       </TouchableOpacity>
//     </View>
//   );
// }


import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext'; // Dynamic theme colors
import { addMonths, monthLabel } from '../utils/format';

export default function MonthSwitcher({ date, onChange, disabled }) {
  const { colors } = useAuth(); // Light/Dark mode dynamic colors

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.card, // Light/Dark mode er sathe background change hobe
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: disabled ? 0.4 : 1,
        marginBottom: 12
      }}
    >
      <TouchableOpacity disabled={disabled} onPress={() => onChange(addMonths(date, -1))} hitSlop={10}>
        <Icon name="chevron-left" size={26} color={colors.text} />
      </TouchableOpacity>

      <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>
        {monthLabel(date)}
      </Text>

      <TouchableOpacity disabled={disabled} onPress={() => onChange(addMonths(date, 1))} hitSlop={10}>
        <Icon name="chevron-right" size={26} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}